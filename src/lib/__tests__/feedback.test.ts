import { describe, expect, it } from "vitest";
import { parseFeedback } from "../feedback";

describe("parseFeedback", () => {
  it("accepts a reaction on its own", () => {
    const r = parseFeedback({ reaction: "good", page_path: "/pricing?x=1" });
    expect(r).toEqual({
      ok: true,
      row: { reaction: "good", message: null, email: null, page_path: "/pricing" },
    });
  });

  it("accepts a message without a reaction and trims it", () => {
    const r = parseFeedback({ message: "  needs a PDF export  ", email: "a@b.co" });
    expect(r.ok && r.row).toMatchObject({ reaction: null, message: "needs a PDF export", email: "a@b.co" });
  });

  it("rejects empty, unknown reactions, bad emails and long messages", () => {
    expect(parseFeedback({}).ok).toBe(false);
    expect(parseFeedback({ reaction: "love" }).ok).toBe(false);
    expect(parseFeedback({ reaction: "bad", email: "nope" }).ok).toBe(false);
    expect(parseFeedback({ message: "x".repeat(1001) }).ok).toBe(false);
    expect(parseFeedback(null).ok).toBe(false);
  });
});
