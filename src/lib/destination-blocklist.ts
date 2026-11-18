/**
 * Hook for destination hosts we refuse to redirect to. There is no Safe
 * Browsing integration in this codebase; add hosts here (or later wire a
 * provider into this function) without changing the rest of validation.
 */
const BLOCKED_DESTINATION_HOSTS = new Set<string>([
  // Add known-bad hosts as lowercase names, e.g. "evil.example".
]);

const BLOCKED_DESTINATION_SUFFIXES: string[] = [
  // e.g. ".onion" if we ever want to refuse those.
];

export function isBlockedDestinationHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!host) return false;
  if (BLOCKED_DESTINATION_HOSTS.has(host)) return true;
  return BLOCKED_DESTINATION_SUFFIXES.some(
    (suffix) => host === suffix.replace(/^\./, "") || host.endsWith(suffix),
  );
}

/** Test-only: check a host against an extra list without mutating the shipped set. */
export function hostMatchesBlocklist(
  hostname: string,
  extraHosts: Iterable<string> = [],
): boolean {
  if (isBlockedDestinationHost(hostname)) return true;
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  const extras = new Set(
    [...extraHosts].map((h) => h.trim().toLowerCase().replace(/\.$/, "")),
  );
  return extras.has(host);
}
