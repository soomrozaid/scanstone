import { describe, expect, it } from "vitest";
import {
  applyTouch,
  buildTouch,
  hasCampaignParams,
  parseAttribution,
  parseCampaignParams,
  parseReferrer,
  sanitizeReferrerUrl,
  sanitizeUtmValue,
  serializeAttribution,
  touchToColumns,
} from "@/lib/attribution";

const NOW = "2026-11-18T22:30:00.000Z";
const NOW_MS = Date.parse(NOW);

function touch(overrides: Record<string, unknown> = {}) {
  return buildTouch({
    referrer: "https://google.com/search?q=scanstone",
    landingPath: "/?ignored=1",
    search: "utm_source=email&utm_medium=outreach&utm_campaign=outreach-2026-11",
    touchedAt: NOW,
    nowMs: NOW_MS,
    ...overrides,
  });
}

describe("parseCampaignParams", () => {
  it("reads utm and click ids, and ignores junk", () => {
    const parsed = parseCampaignParams(
      "utm_source=x&utm_medium=social&utm_campaign=profile&gclid=abc-1&fbclid=Fb_2&utm_term=qr+code&utm_content=bio",
    );
    expect(parsed).toEqual({
      utmSource: "x",
      utmMedium: "social",
      utmCampaign: "profile",
      utmTerm: "qr code",
      utmContent: "bio",
      gclid: "abc-1",
      fbclid: "Fb_2",
    });
    expect(sanitizeUtmValue("bad\nvalue")).toBeNull();
    expect(sanitizeUtmValue("<script>")).toBeNull();
  });
});

describe("parseReferrer", () => {
  it("keeps http(s) hosts and drops credentials, hashes, and unsafe schemes", () => {
    expect(parseReferrer("https://user:pass@google.com/path#frag")).toEqual({
      referrerHost: "google.com",
      referrerUrl: "https://google.com/path",
    });
    expect(sanitizeReferrerUrl("javascript:alert(1)")).toBeNull();
    expect(parseReferrer("")).toEqual({
      referrerHost: null,
      referrerUrl: null,
    });
  });

  it("cuts long referrer URLs", () => {
    const long = `https://example.com/search?q=${"a".repeat(800)}`;
    const parsed = parseReferrer(long);
    expect(parsed.referrerUrl?.length).toBe(500);
    expect(parsed.referrerHost).toBe("example.com");
  });
});

describe("applyTouch", () => {
  it("sets first-touch once and does not overwrite it later", () => {
    const first = touch();
    const state = applyTouch(null, first);
    expect(state.first.utmSource).toBe("email");
    expect(state.last?.utmSource).toBe("email");

    const later = buildTouch({
      referrer: "https://instagram.com/",
      landingPath: "/pricing",
      search: "utm_source=instagram&utm_medium=social&utm_campaign=post-1",
      touchedAt: "2026-11-19T12:00:00.000Z",
      nowMs: Date.parse("2026-11-19T12:00:00.000Z"),
    });
    const next = applyTouch(state, later);
    expect(next.first).toEqual(first);
    expect(next.last?.utmSource).toBe("instagram");
    expect(next.last?.landingPath).toBe("/pricing");
  });

  it("leaves last-touch alone when the page has no campaign params", () => {
    const first = touch();
    const withFirst = applyTouch(null, first);
    const bare = buildTouch({
      referrer: "https://scanstone.ca/",
      landingPath: "/signup",
      search: "",
      touchedAt: "2026-11-19T12:00:00.000Z",
      nowMs: Date.parse("2026-11-19T12:00:00.000Z"),
    });
    expect(hasCampaignParams(bare)).toBe(false);
    const next = applyTouch(withFirst, bare);
    expect(next.first).toEqual(first);
    expect(next.last).toEqual(first);
  });

  it("records an empty first-touch when the first visit has no referrer or UTMs", () => {
    const first = buildTouch({
      referrer: "",
      landingPath: "/",
      search: "",
      touchedAt: NOW,
      nowMs: NOW_MS,
    });
    const state = applyTouch(null, first);
    expect(state.first.referrerHost).toBeNull();
    expect(state.first.landingPath).toBe("/");
    expect(state.last).toBeNull();
  });
});

describe("parseAttribution and columns", () => {
  it("round-trips JSON and maps to first_/last_ columns", () => {
    const state = applyTouch(null, touch());
    const raw = serializeAttribution(state);
    const parsed = parseAttribution(raw, NOW_MS);
    expect(parsed?.first.utmCampaign).toBe("outreach-2026-11");
    expect(touchToColumns("first", parsed!.first)).toMatchObject({
      first_utm_source: "email",
      first_utm_medium: "outreach",
      first_utm_campaign: "outreach-2026-11",
      first_landing_path: "/",
      first_referrer_host: "google.com",
    });
  });

  it("rejects malformed payloads", () => {
    expect(parseAttribution("not-json")).toBeNull();
    expect(parseAttribution("{}")).toBeNull();
  });
});
