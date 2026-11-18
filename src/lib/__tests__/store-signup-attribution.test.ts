import { describe, expect, it, vi, beforeEach } from "vitest";

const cookieJar: Record<string, string | undefined> = {};
const inserts: Array<Record<string, unknown>> = [];
let insertError: { code?: string; message: string } | null = null;

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar[name] ? { value: cookieJar[name] } : undefined,
  }),
}));
vi.mock("@/lib/log", () => ({ log: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      insert: async (row: Record<string, unknown>) => {
        inserts.push(row);
        return { error: insertError };
      },
    }),
  }),
}));

import {
  isRecentSignup,
  storeSignupAttribution,
} from "@/lib/store-signup-attribution";
import { serializeAttribution, applyTouch, buildTouch } from "@/lib/attribution";

const USER = "33333333-3333-4333-8333-333333333333";
const ANON = "a3fefe52-3e6f-4d8b-8d4f-a1d21f653a8c";
const NOW = "2026-11-18T22:30:00.000Z";

function samplePayload() {
  const state = applyTouch(
    null,
    buildTouch({
      referrer: "https://google.com/",
      landingPath: "/",
      search: "utm_source=test&utm_medium=verify&utm_campaign=attrib",
      touchedAt: NOW,
      nowMs: Date.parse(NOW),
    }),
  );
  return serializeAttribution(state);
}

describe("storeSignupAttribution", () => {
  beforeEach(() => {
    Object.keys(cookieJar).forEach((key) => {
      delete cookieJar[key];
    });
    inserts.length = 0;
    insertError = null;
  });

  it("inserts a validated row from the form payload and ss_aid cookie", async () => {
    cookieJar.ss_aid = ANON;
    cookieJar.ss_attr = samplePayload();
    const ok = await storeSignupAttribution(USER, samplePayload());
    expect(ok).toBe(true);
    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      user_id: USER,
      anon_id: ANON,
      first_utm_source: "test",
      first_utm_medium: "verify",
      first_utm_campaign: "attrib",
      first_landing_path: "/",
      first_referrer_host: "google.com",
      last_utm_source: "test",
    });
  });

  it("falls back to the cookie when the form payload is missing", async () => {
    cookieJar.ss_attr = samplePayload();
    expect(await storeSignupAttribution(USER)).toBe(true);
    expect(inserts[0]).toMatchObject({ first_utm_campaign: "attrib" });
  });

  it("does nothing on a bad user id, empty payload, or unique conflict", async () => {
    expect(await storeSignupAttribution("nope", samplePayload())).toBe(false);
    expect(await storeSignupAttribution(USER)).toBe(false);
    cookieJar.ss_attr = samplePayload();
    insertError = { code: "23505", message: "duplicate" };
    expect(await storeSignupAttribution(USER)).toBe(false);
    expect(inserts).toHaveLength(1);
  });
});

describe("isRecentSignup", () => {
  const now = Date.parse("2026-11-18T22:30:00.000Z");
  it("is true within 48 hours and false otherwise", () => {
    expect(isRecentSignup("2026-11-18T20:00:00.000Z", now)).toBe(true);
    expect(isRecentSignup("2026-11-16T22:00:00.000Z", now)).toBe(false);
    expect(isRecentSignup(null, now)).toBe(false);
  });
});
