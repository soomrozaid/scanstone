import { classifyUserAgent, type DeviceType } from "@/lib/ua";

export type RequestContext = {
  country: string | null;
  region: string | null;
  city: string | null;
  user_agent: string | null;
  device_type: DeviceType;
  browser: string | null;
  os: string | null;
  language: string | null;
  language_header: string | null;
};

type HeaderSource =
  | Headers
  | { get(name: string): string | null };

function getHeader(headers: HeaderSource, name: string): string | null {
  const value = headers.get(name);
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function clip(value: string | null, max: number): string | null {
  if (!value) return null;
  const t = value.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}

/** Primary language tag, e.g. en-CA, from an Accept-Language header. */
export function primaryLanguage(header: string | null): string | null {
  if (!header) return null;
  const first = header.split(",")[0]?.trim().split(";")[0]?.trim();
  if (!first) return null;
  if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(first)) return null;
  return first;
}

/**
 * Coarse request context for generation events. Derived only from request
 * headers. The IP address is never returned or stored.
 */
export function requestContextFromHeaders(headers: HeaderSource): RequestContext {
  const ua = clip(getHeader(headers, "user-agent"), 512);
  const classified = classifyUserAgent(ua);
  const languageHeader = clip(getHeader(headers, "accept-language"), 128);
  return {
    country: clip(getHeader(headers, "x-vercel-ip-country"), 8),
    region: clip(getHeader(headers, "x-vercel-ip-country-region"), 64),
    city: clip(getHeader(headers, "x-vercel-ip-city"), 64),
    user_agent: ua,
    device_type: classified.deviceType,
    browser: clip(classified.browser, 32),
    os: clip(classified.os, 16),
    language: primaryLanguage(languageHeader),
    language_header: languageHeader,
  };
}
