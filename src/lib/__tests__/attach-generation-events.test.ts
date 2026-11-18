import { describe, expect, it, vi, beforeEach } from "vitest";

const cookieValue: { current: string | undefined } = { current: undefined };
const updates: Array<Record<string, unknown>> = [];

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "ss_aid" && cookieValue.current
        ? { value: cookieValue.current }
        : undefined,
  }),
}));
vi.mock("@/lib/log", () => ({ log: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: () => {
      const chain: Record<string, unknown> = {};
      chain.update = (row: Record<string, unknown>) => {
        updates.push({ ...row });
        return chain;
      };
      chain.eq = (col: string, val: unknown) => {
        updates[updates.length - 1]![`eq_${col}`] = val;
        return chain;
      };
      chain.is = (col: string, val: unknown) => {
        updates[updates.length - 1]![`is_${col}`] = val;
        return chain;
      };
      chain.select = async () => ({
        data: [{ id: 1 }, { id: 2 }],
        error: null,
      });
      return chain;
    },
  }),
}));

import { attachGenerationEventsFromCookie } from "@/lib/attach-generation-events";

const USER = "22222222-2222-4222-8222-222222222222";
const ANON = "a3fefe52-3e6f-4d8b-8d4f-a1d21f653a8c";

describe("attachGenerationEventsFromCookie", () => {
  beforeEach(() => {
    cookieValue.current = ANON;
    updates.length = 0;
  });

  it("updates only unattached rows for a valid ss_aid cookie", async () => {
    const n = await attachGenerationEventsFromCookie(USER);
    expect(n).toBe(2);
    expect(updates).toEqual([
      {
        user_id: USER,
        eq_anon_id: ANON,
        is_user_id: null,
      },
    ]);
  });

  it("does nothing when the cookie is missing or not a uuid", async () => {
    cookieValue.current = undefined;
    expect(await attachGenerationEventsFromCookie(USER)).toBe(0);
    cookieValue.current = "not-a-uuid";
    expect(await attachGenerationEventsFromCookie(USER)).toBe(0);
    expect(await attachGenerationEventsFromCookie("nope")).toBe(0);
    expect(updates).toEqual([]);
  });
});
