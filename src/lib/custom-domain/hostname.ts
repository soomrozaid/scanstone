/**
 * Hostname normalization, reserved-host checks, and request-host selection.
 * Pure functions: no env or database access, so unit tests can pin behavior
 * including the scst.one / scanstone.ca contract and host-header spoofing.
 */

const HOSTNAME_PATTERN =
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;

/** Scanstone-owned and platform hosts that no customer may claim. */
export const BUILTIN_RESERVED_HOSTS = [
  "scanstone.ca",
  "www.scanstone.ca",
  "scst.one",
  "www.scst.one",
  "scanstone.vercel.app",
  "fable-proj.vercel.app",
  "localhost",
  "localhost.localdomain",
] as const;

export type HostKind = "platform" | "short" | "custom-candidate" | "invalid";

export interface HostClassification {
  kind: HostKind;
  hostname: string;
}

/**
 * Lowercase, strip a trailing dot and an optional port. Returns null when the
 * input is empty, an IP address, or not a hostname.
 */
export function normalizeHostname(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  let host = raw.trim().toLowerCase();
  if (!host) return null;

  // Reject credentials or paths smuggled into a Host header.
  if (host.includes("@") || host.includes("/") || host.includes(" ")) {
    return null;
  }

  // IPv6 literals, including an optional port: [::1]:3000
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    if (end === -1) return null;
    const literal = host.slice(1, end);
    if (literal === "::1") return "::1";
    return null;
  }

  host = host.replace(/\.+$/, "");
  const colon = host.lastIndexOf(":");
  if (colon !== -1 && /^\d+$/.test(host.slice(colon + 1))) {
    host = host.slice(0, colon).replace(/\.+$/, "");
  }

  if (!host || host.length > 253) return null;
  if (host === "127.0.0.1") return "127.0.0.1";
  if (IPV4_PATTERN.test(host)) return null;
  if (host === "localhost" || host.endsWith(".localhost")) return "localhost";
  if (!HOSTNAME_PATTERN.test(host)) return null;
  return host;
}

export function isReservedHostname(
  hostname: string,
  extraReserved: readonly string[] = [],
): boolean {
  if (
    BUILTIN_RESERVED_HOSTS.includes(
      hostname as (typeof BUILTIN_RESERVED_HOSTS)[number],
    )
  ) {
    return true;
  }
  if (hostname.endsWith(".vercel.app") || hostname === "vercel.app")
    return true;
  if (hostname.endsWith(".scanstone.ca") || hostname.endsWith(".scst.one")) {
    return true;
  }
  if (hostname === "127.0.0.1" || hostname === "::1") return true;
  return extraReserved.some((reserved) => reserved === hostname);
}

export function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  );
}

export function hostsFromOrigin(origin: string | undefined | null): string[] {
  if (!origin) return [];
  try {
    const hostname = normalizeHostname(new URL(origin).host);
    return hostname ? [hostname] : [];
  } catch {
    return [];
  }
}

/**
 * Classify a already-normalized hostname against the app and short origins.
 * "custom-candidate" means "not ours, look it up in custom_domains".
 */
export function classifyHostname(
  hostname: string,
  opts: { appHosts: readonly string[]; shortHosts: readonly string[] },
): HostKind {
  if (isLocalDevHost(hostname)) return "platform";
  if (opts.shortHosts.includes(hostname)) return "short";
  if (opts.appHosts.includes(hostname)) return "platform";
  if (isReservedHostname(hostname, [...opts.appHosts, ...opts.shortHosts])) {
    return "platform";
  }
  return "custom-candidate";
}

/**
 * Pick the hostname that may decide tenant scope.
 *
 * In production, the connection host (nextUrl.hostname) always wins. A spoofed
 * Host or x-forwarded-host header on scanstone.ca / scst.one / *.vercel.app
 * cannot move the request into another tenant's custom-domain scope.
 *
 * Locally, the connection host is localhost, so we honor Host the same way
 * the existing scst.one rewrite tests do.
 */
export function effectiveRequestHost(opts: {
  urlHostname: string | null | undefined;
  headerHost: string | null | undefined;
  forwardedHost?: string | null | undefined;
  appHosts: readonly string[];
  shortHosts: readonly string[];
}): HostClassification {
  const urlHost = normalizeHostname(opts.urlHostname);
  const headerHost = normalizeHostname(opts.headerHost);
  // Intentionally unused for tenancy: recorded so tests can prove we ignore it
  // when the connection host is a platform host.
  void opts.forwardedHost;

  const pick = (hostname: string): HostClassification => ({
    kind: classifyHostname(hostname, opts),
    hostname,
  });

  if (urlHost && isLocalDevHost(urlHost)) {
    if (headerHost) return pick(headerHost);
    return pick(urlHost);
  }

  if (urlHost) return pick(urlHost);

  // No connection host (should not happen in Next). Fall back conservatively:
  // only honor the header when it is one of our own hosts; otherwise invalid.
  if (headerHost) {
    const kind = classifyHostname(headerHost, opts);
    if (kind === "platform" || kind === "short") {
      return { kind, hostname: headerHost };
    }
  }
  return { kind: "invalid", hostname: urlHost ?? headerHost ?? "" };
}

export function validateCustomHostname(
  raw: string,
  opts: { appHosts: readonly string[]; shortHosts: readonly string[] },
): { ok: true; hostname: string } | { ok: false; error: string } {
  const hostname = normalizeHostname(raw);
  if (!hostname) {
    return {
      ok: false,
      error: "Enter a domain like qr.theircafe.com, without http:// or a path.",
    };
  }
  if (hostname.split(".").length < 2) {
    return { ok: false, error: "Enter a full domain, like qr.theircafe.com." };
  }
  if (isReservedHostname(hostname, [...opts.appHosts, ...opts.shortHosts])) {
    return {
      ok: false,
      error: "That domain belongs to Scanstone or the hosting platform.",
    };
  }
  if (classifyHostname(hostname, opts) !== "custom-candidate") {
    return {
      ok: false,
      error: "That domain belongs to Scanstone or the hosting platform.",
    };
  }
  return { ok: true, hostname };
}
