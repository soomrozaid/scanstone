import { generateSlug } from "@/lib/slug";
import { validateDestinationUrl, codeNameSchema, designSchema } from "@/lib/validate";
import { getShortUrl } from "@/lib/short-url";
import {
  GUEST_COOKIE_MAX_AGE_SECONDS,
  GUEST_DAILY_LIMIT,
  GUEST_NOTICE_VERSION,
  GUEST_RATE_WINDOW_SECONDS,
  isValidGuestNoticeAcceptance,
} from "@/lib/guest-constants";
import {
  guestCookieOptions,
  hashGuestToken,
  mintGuestToken,
  verifyGuestCookie,
} from "@/lib/guest-cookie";

/** Minimal shape of the service-role client used here. */
export type GuestAdmin = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: boolean | null; error: { message: string } | null }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

export type GuestCreateResult =
  | {
      ok: true;
      shortUrl: string;
      slug: string;
      cookieValue: string;
      cookieOptions: ReturnType<typeof guestCookieOptions>;
    }
  | { ok: false; error: string };

const RATE_LIMIT_MESSAGE =
  "You've made the maximum of 5 short links today from this browser or network. Try again tomorrow, or create a free account.";

const NOTICE_REQUIRED_MESSAGE =
  "Please confirm you understand the limit before creating a link without an account.";

export async function createGuestShortLink(
  admin: GuestAdmin,
  input: {
    destination: string;
    ip: string;
    cookieValue?: string;
    noticeAccepted?: boolean;
    noticeVersion?: string;
    acceptedAt?: Date;
  },
): Promise<GuestCreateResult> {
  if (!isValidGuestNoticeAcceptance(Boolean(input.noticeAccepted), input.noticeVersion)) {
    return { ok: false, error: NOTICE_REQUIRED_MESSAGE };
  }

  const dest = validateDestinationUrl(input.destination);
  if (!dest.ok) return { ok: false, error: dest.error };

  const name = codeNameSchema.safeParse(new URL(dest.url).hostname.slice(0, 80));
  if (!name.success) return { ok: false, error: name.error.issues[0]?.message ?? "Give this link a name." };
  const design = designSchema.parse({});

  let cookieValue = input.cookieValue;
  let token = cookieValue ? verifyGuestCookie(cookieValue) : null;
  if (!token) {
    const minted = mintGuestToken();
    token = minted.token;
    cookieValue = minted.cookieValue;
  }
  const hash = hashGuestToken(token);

  const ipKey = `guest_create:ip:${input.ip || "unknown"}`;
  const tokenKey = `guest_create:token:${hash}`;
  for (const key of [ipKey, tokenKey]) {
    const allowed = await hitLimit(admin, key);
    if (!allowed) return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  let slug: string | null = null;
  for (let attempt = 0; attempt < 3 && !slug; attempt++) {
    const candidate = generateSlug();
    const { data, error } = await admin
      .from("qr_codes")
      .insert({
        user_id: null,
        guest_token_hash: hash,
        slug: candidate,
        name: name.data,
        destination_url: dest.url,
        design,
        guest_notice_accepted_at: (input.acceptedAt ?? new Date()).toISOString(),
        guest_notice_version: GUEST_NOTICE_VERSION,
      })
      .select("id, slug")
      .single();
    if (data?.slug) slug = data.slug;
    else if (error && error.code !== "23505") {
      return { ok: false, error: "Couldn't create the short link. Try again." };
    }
  }
  if (!slug) return { ok: false, error: "Couldn't create the short link. Try again." };

  return {
    ok: true,
    shortUrl: getShortUrl(slug),
    slug,
    cookieValue: cookieValue!,
    cookieOptions: guestCookieOptions(GUEST_COOKIE_MAX_AGE_SECONDS),
  };
}

export async function claimGuestLinks(
  admin: GuestAdmin,
  input: { userId: string; cookieValue?: string },
): Promise<{ claimed: number }> {
  const token = verifyGuestCookie(input.cookieValue);
  if (!token) return { claimed: 0 };
  const hash = hashGuestToken(token);
  const { data, error } = await admin
    .from("qr_codes")
    .update({
      user_id: input.userId,
      guest_token_hash: null,
    })
    .eq("guest_token_hash", hash)
    .is("user_id", null)
    .is("disabled_at", null)
    .select("id");
  if (error) return { claimed: 0 };
  return { claimed: data?.length ?? 0 };
}

async function hitLimit(admin: GuestAdmin, key: string): Promise<boolean> {
  const { data, error } = await admin.rpc("hit_rate_limit", {
    p_key: key,
    p_max: GUEST_DAILY_LIMIT,
    p_window_seconds: GUEST_RATE_WINDOW_SECONDS,
  });
  if (error) {
    // Fail closed for anonymous creation so a broken limiter cannot be used to flood.
    return false;
  }
  return data === true;
}
