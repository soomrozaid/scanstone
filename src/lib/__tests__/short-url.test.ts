import { afterEach, describe, expect, it, vi } from "vitest";

const config = vi.hoisted(() => ({
  APP_URL: "https://scanstone.vercel.app",
  SHORT_URL_ORIGIN: undefined as string | undefined,
}));
vi.mock("@/config/env.client", () => ({ envClient: config }));

import { getShortUrl } from "../short-url";

afterEach(() => {
  config.APP_URL = "https://scanstone.vercel.app";
  config.SHORT_URL_ORIGIN = undefined;
});

describe("short URL domain", () => {
  it("keeps app-domain /r links when no short domain is configured", () => {
    expect(getShortUrl("abcdefgh")).toBe(
      "https://scanstone.vercel.app/r/abcdefgh",
    );
  });

  it("uses the short domain without the /r prefix", () => {
    config.SHORT_URL_ORIGIN = "https://scst.one";
    expect(getShortUrl("abcdefgh")).toBe("https://scst.one/abcdefgh");
  });

  it("handles trailing slashes on either origin", () => {
    config.APP_URL += "/";
    expect(getShortUrl("abcdefgh")).toBe(
      "https://scanstone.vercel.app/r/abcdefgh",
    );
    config.SHORT_URL_ORIGIN = "https://scst.one/";
    expect(getShortUrl("abcdefgh")).toBe("https://scst.one/abcdefgh");
  });
});
