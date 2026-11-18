"use client";

import {
  ATTRIB_COOKIE,
  ATTRIB_MAX_AGE_SECONDS,
  ATTRIB_STORAGE_KEY,
  applyTouch,
  buildTouch,
  parseAttribution,
  serializeAttribution,
  type AttributionState,
} from "@/lib/attribution";
import { readCookieValue } from "@/lib/anon-id";

function cookieString(): string {
  if (typeof document === "undefined") return "";
  return document.cookie;
}

function writeCookie(value: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ATTRIB_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${ATTRIB_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function readStored(): AttributionState | null {
  if (typeof window === "undefined") return null;
  try {
    const fromStorage = window.localStorage.getItem(ATTRIB_STORAGE_KEY);
    const fromStorageParsed = parseAttribution(fromStorage);
    if (fromStorageParsed) return fromStorageParsed;
  } catch {
    // localStorage can throw in private mode.
  }
  try {
    const fromCookie = readCookieValue(cookieString(), ATTRIB_COOKIE);
    return parseAttribution(fromCookie);
  } catch {
    return null;
  }
}

function writeStored(state: AttributionState) {
  const raw = serializeAttribution(state);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ATTRIB_STORAGE_KEY, raw);
    }
  } catch {
    // Ignore quota / private-mode failures; the cookie is enough for signup.
  }
  try {
    writeCookie(raw);
  } catch {
    // Cookie write can fail in locked-down browsers.
  }
}

/**
 * Capture first-touch on the first page view, and refresh last-touch when
 * the URL carries UTM or click-id parameters. First-touch is never overwritten.
 */
export function captureAttribution(now = new Date()): AttributionState | null {
  if (typeof window === "undefined") return null;
  const incoming = buildTouch({
    referrer: document.referrer || null,
    landingPath: window.location.pathname,
    search: window.location.search,
    nowMs: now.getTime(),
  });
  const next = applyTouch(readStored(), incoming);
  writeStored(next);
  return next;
}

export function readAttributionPayload(): string {
  if (typeof window === "undefined") return "";
  const state = readStored();
  return state ? serializeAttribution(state) : "";
}
