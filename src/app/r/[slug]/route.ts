import { NextResponse, after } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { classifyUserAgent } from "@/lib/ua";
import { log } from "@/lib/log";
import { envServer } from "@/config/env.server";
import { SLUG_PATTERN } from "@/lib/slug";
import { effectiveRequestHost } from "@/lib/custom-domain/hostname";
import { platformHostsFromEnv } from "@/lib/custom-domain/platform";
import {
  decideRedirect,
  FOUND_REDIRECT_HEADERS,
} from "@/lib/custom-domain/resolve";
import {
  findCodeBySlug,
  findCodeBySlugForOwner,
  findVerifiedCustomDomain,
} from "@/lib/custom-domain/lookup";

export const dynamic = "force-dynamic";

function notFoundResponse() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function responseFor(
  decision: ReturnType<typeof decideRedirect>,
): NextResponse {
  if (decision.type === "not-found") return notFoundResponse();
  if (decision.type === "missing-code") {
    return NextResponse.redirect(decision.location, 302);
  }
  return NextResponse.redirect(decision.location, {
    status: 302,
    headers: { ...FOUND_REDIRECT_HEADERS },
  });
}

/**
 * THE COVENANT LIVES HERE. This is the redirect fast path: look up the slug,
 * 302, and record the scan after the response is sent. No plan checks, no
 * entitlement gates, no cookies — a Scanstone redirect must never be blocked
 * by billing state.
 *
 * On scst.one and the app domain, slug lookup stays globally unique and the
 * missing-code fallback is unchanged. On a verified custom host, only that
 * owner's slugs resolve.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const hosts = platformHostsFromEnv();
  const classification = effectiveRequestHost({
    urlHostname: new URL(request.url).hostname,
    headerHost: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    ...hosts,
  });

  const admin = createSupabaseAdminClient();
  const appUrl = envServer.APP_URL;

  if (classification.kind === "platform" || classification.kind === "short") {
    const code = SLUG_PATTERN.test(slug)
      ? await findCodeBySlug(admin, slug)
      : null;
    const decision = decideRedirect({
      slug,
      hostKind: classification.kind,
      code,
      appUrl,
    });
    maybeRecordScan(request, admin, slug, decision);
    return responseFor(decision);
  }

  if (classification.kind === "custom-candidate" && classification.hostname) {
    const domain = await findVerifiedCustomDomain(
      admin,
      classification.hostname,
    );
    if (!domain) return notFoundResponse();
    const code = SLUG_PATTERN.test(slug)
      ? await findCodeBySlugForOwner(admin, slug, domain.user_id)
      : null;
    const decision = decideRedirect({
      slug,
      hostKind: "custom",
      domainOwnerId: domain.user_id,
      code,
      appUrl,
    });
    maybeRecordScan(request, admin, slug, decision);
    return responseFor(decision);
  }

  return notFoundResponse();
}

function maybeRecordScan(
  request: Request,
  admin: ReturnType<typeof createSupabaseAdminClient>,
  slug: string,
  decision: ReturnType<typeof decideRedirect>,
) {
  if (decision.type !== "found") return;
  const codeId = decision.codeId;
  const headers = request.headers;
  after(async () => {
    try {
      const { device, os } = classifyUserAgent(headers.get("user-agent"));
      if (device === "bot") return;
      const { error: rpcError } = await admin.rpc("record_scan", {
        p_code_id: codeId,
        p_country: headers.get("x-vercel-ip-country") ?? "unknown",
        p_region: headers.get("x-vercel-ip-country-region") ?? "",
        p_device: device,
        p_os: os,
        p_referer: headers.get("referer") ?? "",
      });
      if (rpcError)
        log("error", "scan_record_failed", { slug, error: rpcError.message });
    } catch (e) {
      log("error", "scan_record_threw", { slug, error: String(e) });
    }
  });
}
