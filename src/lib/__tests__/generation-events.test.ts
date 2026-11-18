import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ after: (fn: () => unknown) => fn() }));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => {
    throw new Error("admin should be passed in");
  },
}));
vi.mock("@/lib/log", () => ({ log: vi.fn() }));

import { recordGenerationEvent } from "@/lib/generation-events";

const ANON = "2c3c5b7e-1c4a-4d6b-9f0a-1234567890ab";
const CODE = "11111111-1111-4111-8111-111111111111";

function mockAdmin(options?: { rateOk?: boolean; insertError?: string }) {
  const inserts: Array<Record<string, unknown>> = [];
  return {
    inserts,
    rpc: async () =>
      options?.rateOk === false
        ? { data: false, error: null }
        : { data: true, error: null },
    from: () => ({
      insert: async (row: Record<string, unknown>) => {
        inserts.push(row);
        return options?.insertError
          ? { error: { message: options.insertError } }
          : { error: null };
      },
    }),
  };
}

describe("recordGenerationEvent", () => {
  const headers = new Headers({
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "x-vercel-ip-country": "CA",
    "x-vercel-ip-country-region": "SK",
    "x-vercel-ip-city": "Regina",
    "accept-language": "en-CA,en;q=0.9",
    "x-forwarded-for": "203.0.113.10",
  });

  it("inserts a static event with request-derived context and no IP", async () => {
    const admin = mockAdmin();
    const result = await recordGenerationEvent(admin, {
      anonId: ANON,
      codeKind: "static",
      action: "generate",
      pagePath: "https://www.scanstone.ca/?v=1",
      codeId: CODE,
      userId: null,
      headers,
      ip: "203.0.113.10",
    });
    expect(result).toEqual({ ok: true });
    expect(admin.inserts).toHaveLength(1);
    const row = admin.inserts[0]!;
    expect(row.anon_id).toBe(ANON);
    expect(row.code_kind).toBe("static");
    expect(row.action).toBe("generate");
    expect(row.page_path).toBe("/");
    expect(row.code_id).toBeNull();
    expect(row.country).toBe("CA");
    expect(row.region).toBe("SK");
    expect(row.city).toBe("Regina");
    expect(row.browser).toBe("Chrome");
    expect(row.device_type).toBe("desktop");
    expect(row.os).toBe("windows");
    expect(row.language).toBe("en-CA");
    expect(row.language_header).toBe("en-CA,en;q=0.9");
    expect(row).not.toHaveProperty("ip");
    expect(JSON.stringify(row)).not.toContain("203.0.113.10");
  });

  it("keeps code_id on a dynamic generate", async () => {
    const admin = mockAdmin();
    const result = await recordGenerationEvent(admin, {
      anonId: ANON,
      codeKind: "dynamic",
      action: "generate",
      pagePath: "/dashboard/new",
      codeId: CODE,
      userId: "22222222-2222-4222-8222-222222222222",
      headers,
    });
    expect(result).toEqual({ ok: true });
    expect(admin.inserts[0]!.code_id).toBe(CODE);
    expect(admin.inserts[0]!.user_id).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
  });

  it("rejects a bad identifier and rate-limit excess", async () => {
    const bad = await recordGenerationEvent(mockAdmin(), {
      anonId: "nope",
      codeKind: "static",
      action: "download",
      pagePath: "/",
      headers,
    });
    expect(bad).toEqual({
      ok: false,
      status: 400,
      error: "Invalid identifier.",
    });

    const limited = await recordGenerationEvent(mockAdmin({ rateOk: false }), {
      anonId: ANON,
      codeKind: "static",
      action: "download",
      pagePath: "/",
      headers,
    });
    expect(limited).toMatchObject({ ok: false, status: 429 });
  });
});
