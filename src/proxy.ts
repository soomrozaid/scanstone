import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { effectiveRequestHost } from "@/lib/custom-domain/hostname";
import { platformHostsFromEnv } from "@/lib/custom-domain/platform";
import { customHostPathAction } from "@/lib/custom-domain/resolve";
import { findVerifiedCustomDomain } from "@/lib/custom-domain/lookup";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Refreshes the Supabase session cookie on navigation and guards /dashboard
 * and /account. Also routes verified custom domains and 404s unknown hosts.
 * Reads env directly for the session client (proxy runs before module graph
 * — the typed config modules are used everywhere else).
 */
export default async function proxy(request: NextRequest) {
  const hosts = platformHostsFromEnv();
  const classification = effectiveRequestHost({
    urlHostname: request.nextUrl.hostname,
    headerHost: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    ...hosts,
  });

  if (classification.kind === "platform" || classification.kind === "short") {
    return maybeGuardAppRoutes(request);
  }

  if (classification.kind === "custom-candidate" && classification.hostname) {
    return routeCustomHost(request, classification.hostname);
  }

  return notFoundResponse();
}

async function routeCustomHost(request: NextRequest, hostname: string) {
  let domain;
  try {
    domain = await findVerifiedCustomDomain(
      createSupabaseAdminClient(),
      hostname,
    );
  } catch {
    return new NextResponse("Service Unavailable", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  if (!domain) return notFoundResponse();

  const action = customHostPathAction(request.nextUrl.pathname);
  if (action.action === "not-found") return notFoundResponse();

  const url = request.nextUrl.clone();
  url.pathname = `/r/${action.slug}`;
  return NextResponse.rewrite(url);
}

function notFoundResponse() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

async function maybeGuardAppRoutes(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/dashboard") || path.startsWith("/account");
  const needsSession = isProtected || path === "/login" || path === "/signup";
  if (!needsSession) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not run code between createServerClient and auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on every page and rewrite target so unknown and custom hosts can be
  // classified. Static assets stay out. Platform hosts still skip session
  // work except on /dashboard, /account, /login, and /signup.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
