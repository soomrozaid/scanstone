import { describe, expect, it } from "vitest";
import {
  RESHOW_AFTER_DAYS,
  RESHOW_AFTER_MORE_GENERATIONS,
  SHOW_AFTER_GENERATIONS,
  shouldShowSignInPrompt,
} from "@/lib/signin-prompt-state";

describe("shouldShowSignInPrompt", () => {
  const now = Date.parse("2026-11-18T21:00:00Z");

  it("waits until about 3 generations", () => {
    expect(shouldShowSignInPrompt(0, null, now)).toBe(false);
    expect(shouldShowSignInPrompt(2, null, now)).toBe(false);
    expect(shouldShowSignInPrompt(3, null, now)).toBe(true);
    expect(shouldShowSignInPrompt(6, null, now)).toBe(true);
  });

  it("stays hidden after dismissal until 30 days or 20 more generations", () => {
    const dismissed = { at: now, count: SHOW_AFTER_GENERATIONS };
    expect(shouldShowSignInPrompt(5, dismissed, now)).toBe(false);
    expect(
      shouldShowSignInPrompt(
        SHOW_AFTER_GENERATIONS + RESHOW_AFTER_MORE_GENERATIONS - 1,
        dismissed,
        now + 10 * 24 * 60 * 60 * 1000,
      ),
    ).toBe(false);
    expect(
      shouldShowSignInPrompt(
        SHOW_AFTER_GENERATIONS + RESHOW_AFTER_MORE_GENERATIONS,
        dismissed,
        now,
      ),
    ).toBe(true);
    expect(
      shouldShowSignInPrompt(
        SHOW_AFTER_GENERATIONS,
        dismissed,
        now + RESHOW_AFTER_DAYS * 24 * 60 * 60 * 1000,
      ),
    ).toBe(true);
  });
});
