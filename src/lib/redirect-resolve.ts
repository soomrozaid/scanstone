/**
 * Pure redirect decision for /r/[slug]. Existing account links have no
 * disabled_at, so they still 302 to the destination. Guest links work the
 * same way until we disable one for abuse.
 */
export type RedirectDecision =
  | { status: "redirect"; url: string }
  | { status: "unavailable" }
  | { status: "missing" };

export type RedirectCode = {
  destination_url: string;
  disabled_at: string | null;
};

export function resolveShortLinkRedirect(
  code: RedirectCode | null,
): RedirectDecision {
  if (!code) return { status: "missing" };
  if (code.disabled_at) return { status: "unavailable" };
  return { status: "redirect", url: code.destination_url };
}
