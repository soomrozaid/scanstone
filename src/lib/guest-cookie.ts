import "server-only";
import { createHmac, createHash, randomBytes, timingSafeEqual } from "crypto";
import { GUEST_COOKIE_NAME } from "@/lib/guest-constants";

function secret(): string {
  const dedicated = process.env.GUEST_COOKIE_SECRET;
  if (dedicated && dedicated.length >= 32) return dedicated;
  const fallback = process.env.SUPABASE_SECRET_KEY;
  if (fallback && fallback.length >= 32) {
    return createHash("sha256")
      .update(`scanstone-guest-cookie:${fallback}`)
      .digest("hex");
  }
  throw new Error("Guest short links need GUEST_COOKIE_SECRET or SUPABASE_SECRET_KEY");
}

export function hashGuestToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function mintGuestToken(): { token: string; cookieValue: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  const cookieValue = signGuestToken(token);
  return { token, cookieValue, hash: hashGuestToken(token) };
}

export function signGuestToken(token: string): string {
  const sig = createHmac("sha256", secret()).update(token).digest("base64url");
  return `${token}.${sig}`;
}

export function verifyGuestCookie(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const cut = raw.lastIndexOf(".");
  if (cut <= 0) return null;
  const token = raw.slice(0, cut);
  const sig = raw.slice(cut + 1);
  if (!token || !sig) return null;
  const expected = createHmac("sha256", secret()).update(token).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return token;
}

export function guestCookieOptions(maxAge: number) {
  return {
    name: GUEST_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
