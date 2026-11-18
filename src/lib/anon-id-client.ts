"use client";

import {
  ANON_ID_COOKIE,
  ANON_ID_MAX_AGE_SECONDS,
  ANON_ID_STORAGE_KEY,
  isAnonId,
  readCookieValue,
} from "@/lib/anon-id";

function cookieString(): string {
  if (typeof document === "undefined") return "";
  return document.cookie;
}

function writeCookie(id: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ANON_ID_COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=${ANON_ID_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

/**
 * Random first-party identifier. Created on first visit, kept in localStorage
 * and mirrored to the ss_aid cookie so later requests can send it.
 */
export function getOrCreateAnonId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromStorage = window.localStorage.getItem(ANON_ID_STORAGE_KEY);
    const fromCookie = readCookieValue(cookieString(), ANON_ID_COOKIE);
    const id = isAnonId(fromStorage)
      ? fromStorage
      : isAnonId(fromCookie)
        ? fromCookie
        : crypto.randomUUID();
    window.localStorage.setItem(ANON_ID_STORAGE_KEY, id);
    if (fromCookie !== id) writeCookie(id);
    return id;
  } catch {
    try {
      const fromCookie = readCookieValue(cookieString(), ANON_ID_COOKIE);
      if (isAnonId(fromCookie)) return fromCookie;
      const id = crypto.randomUUID();
      writeCookie(id);
      return id;
    } catch {
      return null;
    }
  }
}
