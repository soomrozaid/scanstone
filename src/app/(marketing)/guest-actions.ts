"use server";

import { cookies, headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createGuestShortLink } from "@/lib/guest-links";
import {
  GUEST_COOKIE_NAME,
  isValidGuestNoticeAcceptance,
} from "@/lib/guest-constants";
import { log } from "@/lib/log";
import { ANON_ID_COOKIE } from "@/lib/anon-id";
import { tryRecordDynamicGeneration } from "@/lib/generation-events";

export type GuestLinkState =
  | { error?: string; shortUrl?: string; slug?: string }
  | null;

export async function createGuestShortUrl(
  _prev: GuestLinkState,
  formData: FormData,
): Promise<GuestLinkState> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return {
        error:
          "You're already signed in. Use Create short link to save this to your account.",
      };
    }
  } catch {
    // No auth configured (Preview without keys). Continue as a guest if the
    // service-role client is available; otherwise the admin client throws below.
  }

  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = (forwarded ?? "unknown").split(",")[0]?.trim() || "unknown";
  const jar = await cookies();

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return {
      error:
        "Short links aren't available in this environment yet. Try again on the live site, or create a free account.",
    };
  }

  const noticeAccepted = formData.get("guest_notice_accepted") === "1";
  const noticeVersion = String(formData.get("guest_notice_version") ?? "");
  if (!isValidGuestNoticeAcceptance(noticeAccepted, noticeVersion)) {
    return {
      error:
        "Please confirm you understand the limit before creating a link without an account.",
    };
  }

  const result = await createGuestShortLink(admin, {
    destination: String(formData.get("destination_url") ?? ""),
    ip,
    cookieValue: jar.get(GUEST_COOKIE_NAME)?.value,
    noticeAccepted,
    noticeVersion,
  });

  if (!result.ok) return { error: result.error };

  jar.set(result.cookieOptions.name, result.cookieValue, result.cookieOptions);
  const headerList = await headers();
  tryRecordDynamicGeneration({
    anonId: jar.get(ANON_ID_COOKIE)?.value,
    pagePath: headerList.get("referer") ?? "/",
    codeId: result.id,
    userId: null,
    headers: headerList,
    ip,
  });
  log("info", "guest_link_created", { slug: result.slug });
  return { shortUrl: result.shortUrl, slug: result.slug };
}
