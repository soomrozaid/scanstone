
import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  GUEST_NOTICE_TEXT,
  GUEST_NOTICE_VERSION,
  isValidGuestNoticeAcceptance,
} from "@/lib/guest-constants";
import {
  mintGuestToken,
  signGuestToken,
  verifyGuestCookie,
} from "@/lib/guest-cookie";
import { createGuestShortLink, claimGuestLinks } from "@/lib/guest-links";
import { resolveShortLinkRedirect } from "@/lib/redirect-resolve";
import { safeNext } from "@/lib/safe-next";
import { hostMatchesBlocklist } from "@/lib/destination-blocklist";

beforeAll(() => {
  process.env.GUEST_COOKIE_SECRET = "a".repeat(32) + "test-guest-cookie-secret";
  process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
  process.env.APP_URL ??= "http://localhost:3000";
});

function mockAdmin(options?: {
  rateOk?: boolean;
  rateError?: boolean;
  insertError?: { code?: string; message: string };
}) {
  const inserts: Array<Record<string, unknown>> = [];
  const updates: Array<Record<string, unknown>> = [];
  return {
    inserts,
    updates,
    rpc: async () =>
      options?.rateError
        ? { data: null, error: { message: "limiter down" } }
        : { data: options?.rateOk ?? true, error: null },
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        inserts.push(row);
        return {
          select: () => ({
            single: async () =>
              options?.insertError
                ? { data: null, error: options.insertError }
                : {
                    data: {
                      id: "11111111-1111-1111-1111-111111111111",
                      slug: row.slug,
                    },
                    error: null,
                  },
          }),
        };
      },
      update: (row: Record<string, unknown>) => {
        updates.push(row);
        const chain = {
          eq: () => chain,
          is: () => chain,
          select: async () => ({
            data: [{ id: "11111111-1111-1111-1111-111111111111" }],
            error: null,
          }),
        };
        return chain;
      },
    }),
  };
}

describe("guest notice acceptance", () => {
  it("accepts only the current version when the box is checked", () => {
    expect(isValidGuestNoticeAcceptance(true, GUEST_NOTICE_VERSION)).toBe(true);
    expect(isValidGuestNoticeAcceptance(false, GUEST_NOTICE_VERSION)).toBe(false);
    expect(isValidGuestNoticeAcceptance(true, "v0")).toBe(false);
    expect(isValidGuestNoticeAcceptance(true, undefined)).toBe(false);
    expect(GUEST_NOTICE_TEXT).toMatch(
      /may not be kept forever without an account/i,
    );
  });

  it("rejects guest creation without a valid acceptance", async () => {
    const admin = mockAdmin();
    const result = await createGuestShortLink(admin, {
      destination: "https://example.com/menu",
      ip: "1.2.3.4",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/confirm you understand/i);
    expect(admin.inserts).toHaveLength(0);
  });

  it("stores the acceptance timestamp and wording version on the guest row", async () => {
    const admin = mockAdmin();
    const acceptedAt = new Date("2026-11-13T20:53:00Z");
    const result = await createGuestShortLink(admin, {
      destination: "https://example.com/menu",
      ip: "1.2.3.4",
      noticeAccepted: true,
      noticeVersion: GUEST_NOTICE_VERSION,
      acceptedAt,
    });
    expect(result.ok).toBe(true);
    expect(admin.inserts).toHaveLength(1);
    expect(admin.inserts[0]?.user_id).toBeNull();
    expect(admin.inserts[0]?.guest_notice_version).toBe(GUEST_NOTICE_VERSION);
    expect(admin.inserts[0]?.guest_notice_accepted_at).toBe(
      acceptedAt.toISOString(),
    );
    if (result.ok) {
      expect(result.shortUrl).toMatch(
        /\/(?:r\/)?[23456789abcdefghjkmnpqrstuvwxyz]{8}$/,
      );
    }
  });
});

describe("guest rate limits", () => {
  const accepted = {
    destination: "https://example.com/menu",
    ip: "1.2.3.4",
    noticeAccepted: true,
    noticeVersion: GUEST_NOTICE_VERSION,
  };

  it("blocks a sixth create in the same day", async () => {
    const admin = mockAdmin({ rateOk: false });
    const result = await createGuestShortLink(admin, accepted);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/maximum of 5 short links today/i);
    }
    expect(admin.inserts).toHaveLength(0);
  });

  it("fails closed if the limiter errors", async () => {
    const admin = mockAdmin({ rateError: true });
    const result = await createGuestShortLink(admin, accepted);
    expect(result.ok).toBe(false);
    expect(admin.inserts).toHaveLength(0);
  });
});

describe("claim", () => {
  it("moves guest rows onto the account and clears the token hash", async () => {
    process.env.GUEST_COOKIE_SECRET = "a".repeat(32) + "test-guest-cookie-secret";
    const minted = mintGuestToken();
    const admin = mockAdmin();
    const { claimed } = await claimGuestLinks(admin, {
      userId: "user-1",
      cookieValue: minted.cookieValue,
    });
    expect(claimed).toBe(1);
    expect(admin.updates[0]).toEqual({
      user_id: "user-1",
      guest_token_hash: null,
    });
  });

  it("claims nothing for a missing or forged cookie", async () => {
    const admin = mockAdmin();
    expect((await claimGuestLinks(admin, { userId: "user-1" })).claimed).toBe(0);
    expect(
      (
        await claimGuestLinks(admin, {
          userId: "user-1",
          cookieValue: "nope.sig",
        })
      ).claimed,
    ).toBe(0);
    expect(admin.updates).toHaveLength(0);
  });
});

describe("redirect decision (existing links stay the same)", () => {
  it("sends an ordinary account link to its destination", () => {
    expect(
      resolveShortLinkRedirect({
        destination_url: "https://example.com/menu",
        disabled_at: null,
      }),
    ).toEqual({ status: "redirect", url: "https://example.com/menu" });
  });

  it("sends a guest link with no disabled_at to its destination", () => {
    expect(
      resolveShortLinkRedirect({
        destination_url: "https://example.com/summer",
        disabled_at: null,
      }),
    ).toEqual({ status: "redirect", url: "https://example.com/summer" });
  });

  it("sends a disabled link to the unavailable page, not a bare miss", () => {
    expect(
      resolveShortLinkRedirect({
        destination_url: "https://example.com/x",
        disabled_at: "2026-11-13T20:00:00Z",
      }),
    ).toEqual({ status: "unavailable" });
  });

  it("treats a missing slug as missing", () => {
    expect(resolveShortLinkRedirect(null)).toEqual({ status: "missing" });
  });
});

describe("guest cookies", () => {
  it("round-trips a signed token and rejects a tampered one", () => {
    const minted = mintGuestToken();
    expect(verifyGuestCookie(minted.cookieValue)).toBe(minted.token);
    expect(verifyGuestCookie(minted.cookieValue.replace(/.$/, "x"))).toBeNull();
    expect(verifyGuestCookie(signGuestToken(minted.token))).toBe(minted.token);
  });
});

describe("safeNext", () => {
  it("allows only relative in-site paths", () => {
    expect(safeNext("/dashboard")).toBe("/dashboard");
    expect(safeNext("/dashboard/codes/abc?x=1")).toBe(
      "/dashboard/codes/abc?x=1",
    );
    expect(safeNext("https://evil.test")).toBe("/dashboard");
    expect(safeNext("//evil.test")).toBe("/dashboard");
    expect(safeNext("https://example.com")).toBe("/dashboard");
  });
});

describe("destination blocklist hook", () => {
  it("can be extended without changing shipped hosts", () => {
    expect(hostMatchesBlocklist("example.com")).toBe(false);
    expect(hostMatchesBlocklist("evil.test", ["evil.test"])).toBe(true);
  });
});

describe("migration safeguards", () => {
  it("does not add client policies that would let guests read other links", () => {
    const sql = readFileSync(
      path.resolve(
        __dirname,
        "../../../supabase/migrations/20261113215000_guest_short_links.sql",
      ),
      "utf8",
    );
    expect(sql).toContain("No new client policies are added");
    expect(sql).toContain("guest_notice_accepted_at");
    expect(sql).not.toMatch(/create policy/i);
    expect(sql).not.toContain("expires_at");
  });
});
