import "server-only";

import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ANON_ID_COOKIE, isAnonId } from "@/lib/anon-id";
import {
  ATTRIB_COOKIE,
  parseAttribution,
  touchToColumns,
  type AttributionState,
} from "@/lib/attribution";
import { log } from "@/lib/log";

const USER_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const RECENT_SIGNUP_MS = 48 * 60 * 60 * 1000;

function parsePayload(raw: unknown): AttributionState | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  return parseAttribution(raw);
}

/**
 * Store first- and last-touch attribution on a new account. Never overwrites
 * an existing row. Never throws. No IP is stored.
 */
export async function storeSignupAttribution(
  userId: string,
  formPayload?: unknown,
): Promise<boolean> {
  if (!USER_ID_RE.test(userId)) return false;
  try {
    const jar = await cookies();
    const fromForm = parsePayload(formPayload);
    const fromCookie = parsePayload(jar.get(ATTRIB_COOKIE)?.value ?? null);
    const state = fromForm ?? fromCookie;
    if (!state) return false;

    const anonRaw = jar.get(ANON_ID_COOKIE)?.value;
    const anonId = isAnonId(anonRaw) ? anonRaw : null;

    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("signup_attribution").insert({
      user_id: userId,
      anon_id: anonId,
      ...touchToColumns("first", state.first),
      ...touchToColumns("last", state.last),
    });
    if (error) {
      // 23505 = unique_violation: already stored for this account.
      if (error.code === "23505") return false;
      log("error", "signup_attribution_insert_failed", {
        user: userId,
        error: error.message,
      });
      return false;
    }
    log("info", "signup_attribution_stored", { user: userId });
    return true;
  } catch (error) {
    log("error", "signup_attribution_threw", {
      user: userId,
      error: String(error),
    });
    return false;
  }
}

/** Fallback for the auth-callback path when email confirmation is delayed. */
export function isRecentSignup(createdAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!createdAt) return false;
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return false;
  return nowMs - created >= 0 && nowMs - created <= RECENT_SIGNUP_MS;
}
