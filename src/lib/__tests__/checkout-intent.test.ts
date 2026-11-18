import { describe, expect, it } from "vitest";
import {
  authCallbackUrl,
  parseProInterval,
  postAuthPath,
  safeNextPath,
  upgradePath,
} from "../checkout-intent";

describe("parseProInterval", () => {
  it("accepts only the allowlisted intervals", () => {
    expect(parseProInterval("monthly")).toBe("monthly");
    expect(parseProInterval("yearly")).toBe("yearly");
  });
  it("rejects everything else", () => {
    for (const v of [
      "",
      "Monthly",
      "weekly",
      "pro",
      "yearly ",
      null,
      undefined,
      1,
      ["yearly"],
    ]) {
      expect(parseProInterval(v)).toBeNull();
    }
  });
});

describe("safeNextPath", () => {
  it("keeps same-site paths with query strings", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/account/upgrade?plan=yearly")).toBe(
      "/account/upgrade?plan=yearly",
    );
  });
  it("blocks open redirects", () => {
    for (const v of [
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "\\\\evil.com",
      "/%0a//evil.com".replace("%0a", "\n"),
      "javascript:alert(1)",
      "evil.com",
      "",
      null,
      undefined,
    ]) {
      expect(safeNextPath(v)).toBe("/dashboard");
    }
  });
  it("uses the given fallback", () => {
    expect(safeNextPath("//x", "/account")).toBe("/account");
  });
});

describe("postAuthPath", () => {
  it("sends a valid Pro choice to the upgrade page", () => {
    expect(postAuthPath("yearly", "/dashboard")).toBe(upgradePath("yearly"));
    expect(postAuthPath("monthly", null)).toBe("/account/upgrade?plan=monthly");
  });
  it("ignores a bad plan and falls back to a safe next", () => {
    expect(postAuthPath("free", "/dashboard/new")).toBe("/dashboard/new");
    expect(postAuthPath("https://evil.com", "//evil.com")).toBe("/dashboard");
  });
});

describe("authCallbackUrl", () => {
  it("encodes the next path", () => {
    expect(
      authCallbackUrl(
        "https://www.scanstone.ca/",
        "/account/upgrade?plan=yearly",
      ),
    ).toBe(
      "https://www.scanstone.ca/auth/callback?next=%2Faccount%2Fupgrade%3Fplan%3Dyearly",
    );
  });
  it("never embeds an unsafe next", () => {
    expect(authCallbackUrl("https://www.scanstone.ca", "//evil.com")).toBe(
      "https://www.scanstone.ca/auth/callback?next=%2Fdashboard",
    );
  });
});
