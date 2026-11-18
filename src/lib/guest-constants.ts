/** Max new guest short links per IP and per guest cookie, per rolling day. */
export const GUEST_DAILY_LIMIT = 5;

export const GUEST_RATE_WINDOW_SECONDS = 60 * 60 * 24;

export const GUEST_COOKIE_NAME = "scanstone_guest";

/** Cookie lasts a year so a visitor can come back and claim links they already made. */
export const GUEST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Versioned wording the visitor must accept before we mint a guest link.
 * Bump the version if the text changes, so stored acceptances stay accurate.
 */
export const GUEST_NOTICE_VERSION = "v1";

export const GUEST_NOTICE_TEXT =
  "I understand my link may not be kept forever without an account, and I want to continue without one.";

export function isValidGuestNoticeAcceptance(
  accepted: boolean,
  version: string | undefined | null,
): boolean {
  return accepted === true && version === GUEST_NOTICE_VERSION;
}
