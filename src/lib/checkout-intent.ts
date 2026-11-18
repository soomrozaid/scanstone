/**
 * Carries a "Go Pro" choice from /pricing through signup or login to Stripe
 * checkout. Every value that reaches a redirect goes through these helpers.
 */

export const PRO_INTERVALS = ["monthly", "yearly"] as const;
export type ProInterval = (typeof PRO_INTERVALS)[number];

/** Only exact allowlisted values count. Anything else means "no Pro choice". */
export function parseProInterval(raw: unknown): ProInterval | null {
  if (typeof raw !== "string") return null;
  return (PRO_INTERVALS as readonly string[]).includes(raw)
    ? (raw as ProInterval)
    : null;
}

/** Signed-in page that sends the visitor on to Stripe checkout. */
export const UPGRADE_PATH = "/account/upgrade";

export function upgradePath(interval: ProInterval): string {
  return `${UPGRADE_PATH}?plan=${interval}`;
}

/**
 * Returns a same-site path to send someone to after auth, or the fallback.
 * Rejects absolute URLs, protocol-relative URLs ("//x"), backslash tricks
 * ("/\\x", which browsers treat like "//x") and control characters.
 */
export function safeNextPath(raw: unknown, fallback = "/dashboard"): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 512) {
    return fallback;
  }
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(raw)) return fallback;
  try {
    const parsed = new URL(raw, "https://scanstone.invalid");
    if (parsed.origin !== "https://scanstone.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Where to go after auth: a valid Pro choice wins and goes to checkout,
 * otherwise a safe `next`, otherwise the dashboard.
 */
export function postAuthPath(plan: unknown, next: unknown): string {
  const interval = parseProInterval(plan);
  if (interval) return upgradePath(interval);
  return safeNextPath(next);
}

/** The /auth/callback URL used for email confirmation and sign-in links. */
export function authCallbackUrl(appUrl: string, nextPath: string): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}/auth/callback?next=${encodeURIComponent(safeNextPath(nextPath))}`;
}
