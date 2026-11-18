export const ANON_ID_COOKIE = "ss_aid";
export const ANON_ID_STORAGE_KEY = "ss_aid";
/** ~400 days, within typical browser cookie caps. */
export const ANON_ID_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isAnonId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function sanitizePagePath(raw: unknown): string {
  let value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "/";
  try {
    if (/^https?:\/\//i.test(value)) {
      value = new URL(value).pathname;
    }
  } catch {
    return "/";
  }
  const cut = value.split("#")[0]?.split("?")[0] ?? "/";
  const withSlash = cut.startsWith("/") ? cut : `/${cut}`;
  const collapsed = withSlash.replace(/\/{2,}/g, "/");
  const clipped = collapsed.length > 200 ? collapsed.slice(0, 200) : collapsed;
  if (clipped.includes("..")) return "/";
  if (!/^\/[A-Za-z0-9\-._/~]*$/.test(clipped)) return "/";
  return clipped;
}

export function readCookieValue(source: string, name: string): string | null {
  const parts = source.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
