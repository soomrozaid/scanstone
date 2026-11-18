/** Allow only same-origin relative paths, so auth redirects cannot leave the site. */
export function safeNext(raw: unknown, fallback = "/dashboard"): string {
  if (typeof raw !== "string") return fallback;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  if (value.includes("://")) return fallback;
  return value;
}
