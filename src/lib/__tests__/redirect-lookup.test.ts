import { describe, expect, it, vi } from "vitest";
import {
  lookupWithRetry,
  tryAgainResponse,
  TRY_AGAIN_HTML,
} from "../redirect-lookup";

const row = { id: "1", destination_url: "https://example.com" };

describe("lookupWithRetry", () => {
  it("returns found on the first success without retrying", async () => {
    const attempt = vi.fn().mockResolvedValue({ data: row, error: null });
    expect(await lookupWithRetry(attempt, { delayMs: 0 })).toEqual({
      kind: "found",
      row,
    });
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it("treats no row as missing, not an error, and does not retry", async () => {
    const attempt = vi.fn().mockResolvedValue({ data: null, error: null });
    expect(await lookupWithRetry(attempt, { delayMs: 0 })).toEqual({
      kind: "missing",
    });
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it("retries once after an error and returns the row", async () => {
    const attempt = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: "timeout" } })
      .mockResolvedValueOnce({ data: row, error: null });
    expect(await lookupWithRetry(attempt, { delayMs: 0 })).toEqual({
      kind: "found",
      row,
    });
    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it("retries once after a thrown error and can find nothing", async () => {
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockResolvedValueOnce({ data: null, error: null });
    expect(await lookupWithRetry(attempt, { delayMs: 0 })).toEqual({
      kind: "missing",
    });
  });

  it("reports an error after two failures and stops", async () => {
    const attempt = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "db down" } });
    const result = await lookupWithRetry(attempt, { delayMs: 0 });
    expect(result).toEqual({ kind: "error", error: "db down" });
    expect(attempt).toHaveBeenCalledTimes(2);
  });
});

describe("tryAgainResponse", () => {
  it("is a 503 with Retry-After and no caching", async () => {
    const res = tryAgainResponse();
    expect(res.status).toBe(503);
    expect(res.headers.get("retry-after")).toBe("5");
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(res.headers.get("content-type")).toContain("text/html");
    const body = await res.text();
    expect(body).toBe(TRY_AGAIN_HTML);
  });

  it("says the code is fine and to scan again, never that it is missing", () => {
    expect(TRY_AGAIN_HTML).toContain("This code is fine");
    expect(TRY_AGAIN_HTML).toContain("Scan it again");
    expect(TRY_AGAIN_HTML).not.toMatch(/doesn.t exist|not found|deleted/i);
    expect(TRY_AGAIN_HTML).not.toContain("\u2014");
  });
});
