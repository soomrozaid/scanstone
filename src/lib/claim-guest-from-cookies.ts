import "server-only";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { claimGuestLinks } from "@/lib/guest-links";
import { GUEST_COOKIE_NAME } from "@/lib/guest-constants";
import { log } from "@/lib/log";

/** Move this browser's guest links onto the signed-in account. Never throws. */
export async function claimGuestLinksFromCookies(userId: string): Promise<number> {
  try {
    const jar = await cookies();
    const cookieValue = jar.get(GUEST_COOKIE_NAME)?.value;
    if (!cookieValue) return 0;
    const admin = createSupabaseAdminClient();
    const { claimed } = await claimGuestLinks(admin, { userId, cookieValue });
    if (claimed > 0) log("info", "guest_links_claimed", { user: userId, claimed });
    return claimed;
  } catch (error) {
    log("error", "guest_claim_failed", { user: userId, error: String(error) });
    return 0;
  }
}
