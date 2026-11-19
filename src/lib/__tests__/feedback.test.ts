import { describe, expect, it } from "vitest";
import { parseFeedback } from "../feedback";

describe("parseFeedback", () => {
  it("accepts a reaction on its own", () => {
    const r = parseFeedback({ reaction: "good", page_path: "/dashboard?x=1" });
    expect(r).toEqual({
      ok: true,
      row: { reaction: "good", topics: [], message: null, page_path: "/dashboard" },
    });
  });

  it("accepts topics without a reaction and drops duplicates", () => {
    const r = parseFeedback({ topics: ["stats", "designs", "stats"] });
    expect(r.ok && r.row.topics).toEqual(["stats", "designs"]);
  });

  it("accepts a message and trims it", () => {
    const r = parseFeedback({ message: "  needs a PDF export  " });
    expect(r.ok && r.row).toMatchObject({ reaction: null, message: "needs a PDF export" });
  });

  it("rejects empty bodies, unknown reactions or topics, and long messages", () => {
    expect(parseFeedback({}).ok).toBe(false);
    expect(parseFeedback({ topics: [] }).ok).toBe(false);
    expect(parseFeedback({ reaction: "love" }).ok).toBe(false);
    expect(parseFeedback({ topics: ["nope"] }).ok).toBe(false);
    expect(parseFeedback({ topics: "stats" }).ok).toBe(false);
    expect(parseFeedback({ message: "x".repeat(1001) }).ok).toBe(false);
    expect(parseFeedback(null).ok).toBe(false);
  });
});
