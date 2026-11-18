import { SLUG_PATTERN } from "@/lib/slug";
import type { HostKind } from "./hostname";

/**
 * Redirect decisions for /r/[slug] and rewritten custom-host slugs.
 *
 * Platform and short-host results must stay aligned with the historical
 * contract: invalid or unknown slugs 302 to APP_URL/?missing-code=1, and a
 * hit 302s to the destination with cache-control: no-store and
 * referrer-policy: no-referrer. Custom hosts never use the missing-code
 * fallback and never resolve another user's slug.
 */

export const MISSING_CODE_PATH = "/?missing-code=1";

export const FOUND_REDIRECT_HEADERS = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
} as const;

export interface RedirectCode {
  id: string;
  destination_url: string;
  user_id: string;
}

export type RedirectDecision =
  | {
      type: "found";
      status: 302;
      location: string;
      headers: typeof FOUND_REDIRECT_HEADERS;
      codeId: string;
      recordScan: true;
    }
  | {
      type: "missing-code";
      status: 302;
      location: string;
    }
  | {
      type: "not-found";
      status: 404;
    };

export interface ResolveRedirectInput {
  slug: string;
  hostKind: HostKind | "custom" | "unknown";
  /** Owner of the verified custom domain. Ignored for platform/short hosts. */
  domainOwnerId?: string | null;
  /** Row from the slug lookup already scoped by the caller. */
  code: RedirectCode | null;
  appUrl: string;
}

/**
 * Decide how to answer a redirect request after the slug has been looked up.
 * The caller is responsible for scoping the lookup: globally unique slug for
 * platform and short hosts, slug + user_id for a verified custom host.
 */
export function decideRedirect(input: ResolveRedirectInput): RedirectDecision {
  const { slug, hostKind, domainOwnerId, code, appUrl } = input;
  const missing: RedirectDecision = {
    type: "missing-code",
    status: 302,
    location: `${appUrl.replace(/\/+$/, "")}${MISSING_CODE_PATH}`,
  };

  if (hostKind === "invalid" || hostKind === "unknown") {
    return { type: "not-found", status: 404 };
  }

  if (hostKind === "custom" || hostKind === "custom-candidate") {
    if (!domainOwnerId) return { type: "not-found", status: 404 };
    if (!SLUG_PATTERN.test(slug) || !code) {
      return { type: "not-found", status: 404 };
    }
    // Defense in depth: even if the lookup was wrong, never return a
    // different tenant's destination from a custom host.
    if (code.user_id !== domainOwnerId) {
      return { type: "not-found", status: 404 };
    }
    return {
      type: "found",
      status: 302,
      location: code.destination_url,
      headers: FOUND_REDIRECT_HEADERS,
      codeId: code.id,
      recordScan: true,
    };
  }

  // Platform and short hosts: historical contract, byte-for-byte.
  if (!SLUG_PATTERN.test(slug) || !code) {
    return missing;
  }
  return {
    type: "found",
    status: 302,
    location: code.destination_url,
    headers: FOUND_REDIRECT_HEADERS,
    codeId: code.id,
    recordScan: true,
  };
}

/** True when a path is a single slug segment (with or without a leading /). */
export function pathSlug(pathname: string): string | null {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  if (!trimmed || trimmed.includes("/")) return null;
  if (!SLUG_PATTERN.test(trimmed)) return null;
  return trimmed;
}

/**
 * Paths a custom host may serve. Everything else is 404 so the customer
 * domain never exposes login, billing, or marketing pages.
 */
export function customHostPathAction(
  pathname: string,
): { action: "rewrite"; slug: string } | { action: "not-found" } {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  if (trimmed.startsWith("/r/")) {
    const slug = pathSlug(trimmed.slice(2));
    if (!slug) return { action: "not-found" };
    return { action: "rewrite", slug };
  }
  const slug = pathSlug(trimmed);
  if (!slug) return { action: "not-found" };
  return { action: "rewrite", slug };
}

export function getCustomUrl(hostname: string, slug: string): string {
  return `https://${hostname.replace(/\/+$/, "")}/${slug}`;
}
