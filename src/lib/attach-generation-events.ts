import "server-only";

import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ANON_ID_COOKIE, isAnonId } from "@/lib/anon-id";
import { log } from "@/lib/log";

const USER_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Link this browser's generation events to a newly signed-in account.
 * Uses the existing user_id column. Only fills rows where user_id is still
 * null, so it is safe to call more than once. Never throws.
 */
export async function attachGenerationEventsFromCookie(
  userId: string,
): Promise<number> {
  if (!USER_ID_RE.test(userId)) return 0;
  try {
    const jar = await cookies();
    const anonId = jar.get(ANON_ID_COOKIE)?.value;
    if (!isAnonId(anonId)) return 0;
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("qr_generation_events")
      .update({ user_id: userId })
      .eq("anon_id", anonId)
      .is("user_id", null)
      .select("id");
    if (error) {
      log("error", "generation_events_attach_failed", {
        user: userId,
        error: error.message,
      });
      return 0;
    }
    const attached = data?.length ?? 0;
    if (attached > 0) {
      log("info", "generation_events_attached", { user: userId, attached });
    }
    return attached;
  } catch (error) {
    log("error", "generation_events_attach_threw", {
      user: userId,
      error: String(error),
    });
    return 0;
  }
}
