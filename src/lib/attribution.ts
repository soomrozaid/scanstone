import { sanitizePagePath } from "@/lib/anon-id";

export const ATTRIB_COOKIE = "ss_attr";
export const ATTRIB_STORAGE_KEY = "ss_attr";
export const ATTRIB_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

export const REFERRER_URL_MAX = 500;
export const REFERRER_HOST_MAX = 253;
export const UTM_VALUE_MAX = 200;
export const CLICK_ID_MAX = 200;

export type TouchRecord = {
  referrerHost: string | null;
  referrerUrl: string | null;
  landingPath: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  fbclid: string | null;
  touchedAt: string;
};

export type AttributionState = {
  v: 1;
  first: TouchRecord;
  last: TouchRecord | null;
};

const UTM_RE = /^[\x20-\x7E]{1,200}$/;
const CLICK_ID_RE = /^[A-Za-z0-9._-]{1,200}$/;
const HOST_RE = /^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.?$/;

function clip(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function emptyToNull(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function sanitizeUtmValue(raw: unknown): string | null {
  const value = emptyToNull(typeof raw === "string" ? raw : null);
  if (!value) return null;
  const cut = clip(value, UTM_VALUE_MAX);
  if (!UTM_RE.test(cut) || /[<>"'\\\x00-\x1f]/.test(cut)) return null;
  return cut;
}

export function sanitizeClickId(raw: unknown): string | null {
  const value = emptyToNull(typeof raw === "string" ? raw : null);
  if (!value) return null;
  const cut = clip(value, CLICK_ID_MAX);
  return CLICK_ID_RE.test(cut) ? cut : null;
}

export function sanitizeReferrerHost(raw: unknown): string | null {
  const value = emptyToNull(typeof raw === "string" ? raw : null);
  if (!value) return null;
  const host = clip(value.toLowerCase().replace(/\.$/, ""), REFERRER_HOST_MAX);
  if (!HOST_RE.test(host)) return null;
  return host;
}

export function sanitizeReferrerUrl(raw: unknown): string | null {
  const value = emptyToNull(typeof raw === "string" ? raw : null);
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.username = "";
    url.password = "";
    url.hash = "";
    return clip(url.toString(), REFERRER_URL_MAX);
  } catch {
    return null;
  }
}

export function sanitizeTouchedAt(raw: unknown, nowMs = Date.now()): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) return null;
  // Reject dates before 2020 and more than a day in the future.
  if (ms < Date.parse("2020-01-01T00:00:00.000Z")) return null;
  if (ms > nowMs + 24 * 60 * 60 * 1000) return null;
  return new Date(ms).toISOString();
}

export function parseCampaignParams(
  search: string | URLSearchParams,
): Pick<
  TouchRecord,
  | "utmSource"
  | "utmMedium"
  | "utmCampaign"
  | "utmTerm"
  | "utmContent"
  | "gclid"
  | "fbclid"
> {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const get = (key: string) => params.get(key) ?? params.get(key.toLowerCase());
  return {
    utmSource: sanitizeUtmValue(get("utm_source")),
    utmMedium: sanitizeUtmValue(get("utm_medium")),
    utmCampaign: sanitizeUtmValue(get("utm_campaign")),
    utmTerm: sanitizeUtmValue(get("utm_term")),
    utmContent: sanitizeUtmValue(get("utm_content")),
    gclid: sanitizeClickId(get("gclid")),
    fbclid: sanitizeClickId(get("fbclid")),
  };
}

export function parseReferrer(raw: string | null | undefined): {
  referrerHost: string | null;
  referrerUrl: string | null;
} {
  const url = sanitizeReferrerUrl(raw ?? null);
  if (!url) return { referrerHost: null, referrerUrl: null };
  try {
    return {
      referrerHost: sanitizeReferrerHost(new URL(url).hostname),
      referrerUrl: url,
    };
  } catch {
    return { referrerHost: null, referrerUrl: null };
  }
}

export function hasCampaignParams(
  touch: Pick<
    TouchRecord,
    | "utmSource"
    | "utmMedium"
    | "utmCampaign"
    | "utmTerm"
    | "utmContent"
    | "gclid"
    | "fbclid"
  >,
): boolean {
  return Boolean(
    touch.utmSource ||
      touch.utmMedium ||
      touch.utmCampaign ||
      touch.utmTerm ||
      touch.utmContent ||
      touch.gclid ||
      touch.fbclid,
  );
}

export function buildTouch(input: {
  referrer?: string | null;
  landingPath?: string | null;
  search?: string | URLSearchParams;
  touchedAt?: string | null;
  nowMs?: number;
}): TouchRecord {
  const nowMs = input.nowMs ?? Date.now();
  const campaign = parseCampaignParams(input.search ?? "");
  return {
    ...parseReferrer(input.referrer ?? null),
    landingPath: sanitizePagePath(input.landingPath ?? "/"),
    ...campaign,
    touchedAt: sanitizeTouchedAt(input.touchedAt, nowMs) ?? new Date(nowMs).toISOString(),
  };
}

export function applyTouch(
  existing: AttributionState | null,
  incoming: TouchRecord,
): AttributionState {
  if (!existing?.first) {
    return {
      v: 1,
      first: incoming,
      last: hasCampaignParams(incoming) ? incoming : null,
    };
  }
  if (hasCampaignParams(incoming)) {
    return { v: 1, first: existing.first, last: incoming };
  }
  return { v: 1, first: existing.first, last: existing.last };
}

export function sanitizeTouch(raw: unknown, nowMs = Date.now()): TouchRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  return {
    referrerHost: sanitizeReferrerHost(value.referrerHost ?? value.rh),
    referrerUrl: sanitizeReferrerUrl(value.referrerUrl ?? value.ru),
    landingPath: sanitizePagePath(
      (value.landingPath as string | undefined) ??
        (value.lp as string | undefined) ??
        "/",
    ),
    utmSource: sanitizeUtmValue(value.utmSource ?? value.us),
    utmMedium: sanitizeUtmValue(value.utmMedium ?? value.um),
    utmCampaign: sanitizeUtmValue(value.utmCampaign ?? value.uc),
    utmTerm: sanitizeUtmValue(value.utmTerm ?? value.ut),
    utmContent: sanitizeUtmValue(value.utmContent ?? value.uo),
    gclid: sanitizeClickId(value.gclid ?? value.g),
    fbclid: sanitizeClickId(value.fbclid ?? value.f),
    touchedAt:
      sanitizeTouchedAt(
        (value.touchedAt as string | undefined) ??
          (value.at as string | undefined),
        nowMs,
      ) ?? new Date(nowMs).toISOString(),
  };
}

export function parseAttribution(raw: unknown, nowMs = Date.now()): AttributionState | null {
  let value = raw;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      value = JSON.parse(trimmed);
    } catch {
      try {
        value = JSON.parse(decodeURIComponent(trimmed));
      } catch {
        return null;
      }
    }
  }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const first = sanitizeTouch(record.first, nowMs);
  if (!first) return null;
  const lastRaw = record.last;
  const last =
    lastRaw == null ? null : sanitizeTouch(lastRaw, nowMs);
  return { v: 1, first, last };
}

export function serializeAttribution(state: AttributionState): string {
  return JSON.stringify({ v: 1, first: state.first, last: state.last });
}

export function touchToColumns(
  prefix: "first" | "last",
  touch: TouchRecord | null,
): Record<string, string | null> {
  const col = (name: string) => `${prefix}_${name}`;
  if (!touch) {
    return {
      [col("referrer_host")]: null,
      [col("referrer_url")]: null,
      [col("landing_path")]: null,
      [col("utm_source")]: null,
      [col("utm_medium")]: null,
      [col("utm_campaign")]: null,
      [col("utm_term")]: null,
      [col("utm_content")]: null,
      [col("gclid")]: null,
      [col("fbclid")]: null,
      [col("touch_at")]: null,
    };
  }
  return {
    [col("referrer_host")]: touch.referrerHost,
    [col("referrer_url")]: touch.referrerUrl,
    [col("landing_path")]: touch.landingPath,
    [col("utm_source")]: touch.utmSource,
    [col("utm_medium")]: touch.utmMedium,
    [col("utm_campaign")]: touch.utmCampaign,
    [col("utm_term")]: touch.utmTerm,
    [col("utm_content")]: touch.utmContent,
    [col("gclid")]: touch.gclid,
    [col("fbclid")]: touch.fbclid,
    [col("touch_at")]: touch.touchedAt,
  };
}
