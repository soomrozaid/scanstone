import { describe, expect, it } from "vitest";
import { primaryLanguage, requestContextFromHeaders } from "@/lib/request-context";
import { isAnonId, sanitizePagePath } from "@/lib/anon-id";

function headers(init: Record<string, string>) {
  return new Headers(init);
}

describe("requestContextFromHeaders", () => {
  it("reads Vercel geo headers and UA fields, and never invents an IP field", () => {
    const ctx = requestContextFromHeaders(
      headers({
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "x-vercel-ip-country": "CA",
        "x-vercel-ip-country-region": "SK",
        "x-vercel-ip-city": "Regina",
        "x-forwarded-for": "203.0.113.10",
        "accept-language": "en-CA,en;q=0.9",
      }),
    );
    expect(ctx).toEqual({
      country: "CA",
      region: "SK",
      city: "Regina",
      user_agent: expect.stringContaining("iPhone"),
      device_type: "phone",
      browser: "Safari",
      os: "ios",
      language: "en-CA",
      language_header: "en-CA,en;q=0.9",
    });
    expect(ctx).not.toHaveProperty("ip");
    expect(JSON.stringify(ctx)).not.toContain("203.0.113.10");
  });

  it("truncates a long user agent", () => {
    const ctx = requestContextFromHeaders(
      headers({ "user-agent": "x".repeat(600) }),
    );
    expect(ctx.user_agent).toHaveLength(512);
  });
});

describe("primaryLanguage", () => {
  it("takes the first tag and ignores q values", () => {
    expect(primaryLanguage("en-CA,en;q=0.9")).toBe("en-CA");
    expect(primaryLanguage("fr")).toBe("fr");
    expect(primaryLanguage("not a language")).toBeNull();
    expect(primaryLanguage(null)).toBeNull();
  });
});

describe("sanitizePagePath", () => {
  it("keeps a safe path and strips origins and query strings", () => {
    expect(sanitizePagePath("/pricing")).toBe("/pricing");
    expect(sanitizePagePath("https://www.scanstone.ca/blog/post?x=1#y")).toBe(
      "/blog/post",
    );
    expect(sanitizePagePath("../etc/passwd")).toBe("/");
    expect(sanitizePagePath("")).toBe("/");
  });
});

describe("isAnonId", () => {
  it("accepts a UUID and rejects other strings", () => {
    expect(isAnonId("2c3c5b7e-1c4a-4d6b-9f0a-1234567890ab")).toBe(true);
    expect(isAnonId("not-a-uuid")).toBe(false);
    expect(isAnonId("")).toBe(false);
  });
});
