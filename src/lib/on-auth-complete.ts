import "server-only";

import { claimGuestLinksFromCookies } from "@/lib/claim-guest-from-cookies";
import { attachGenerationEventsFromCookie } from "@/lib/attach-generation-events";

/** Side effects after signup, sign-in, or an auth callback. Never throws. */
export async function onAuthComplete(userId: string): Promise<void> {
  await claimGuestLinksFromCookies(userId);
  await attachGenerationEventsFromCookie(userId);
}
