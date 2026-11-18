import { describe, expect, it } from "vitest";
import { browserName, classifyUserAgent } from "@/lib/ua";

const CHROME_DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const EDGE_DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
const FIREFOX_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0";
const SAMSUNG =
  "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/110.0.5481.154 Mobile Safari/537.36";
const IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 12; SM-X810) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

describe("classifyUserAgent", () => {
  it("keeps the existing scan device labels and maps phone separately", () => {
    const phone = classifyUserAgent(SAFARI_IPHONE);
    expect(phone.device).toBe("mobile");
    expect(phone.deviceType).toBe("phone");
    expect(phone.os).toBe("ios");
    expect(phone.browser).toBe("Safari");

    const desktop = classifyUserAgent(CHROME_DESKTOP);
    expect(desktop.device).toBe("desktop");
    expect(desktop.deviceType).toBe("desktop");
    expect(desktop.os).toBe("windows");
    expect(desktop.browser).toBe("Chrome");

    const tablet = classifyUserAgent(IPAD);
    expect(tablet.device).toBe("tablet");
    expect(tablet.deviceType).toBe("tablet");

    const androidTablet = classifyUserAgent(ANDROID_TABLET);
    expect(androidTablet.device).toBe("tablet");
    expect(androidTablet.deviceType).toBe("tablet");

    const bot = classifyUserAgent(GOOGLEBOT);
    expect(bot.device).toBe("bot");
    expect(bot.deviceType).toBe("unknown");
  });

  it("returns unknown when there is no UA", () => {
    expect(classifyUserAgent(null)).toEqual({
      device: "unknown",
      os: "unknown",
      deviceType: "unknown",
      browser: "other",
    });
  });
});

describe("browserName", () => {
  it("picks the family name and does not confuse Chrome tokens in other browsers", () => {
    expect(browserName(CHROME_DESKTOP)).toBe("Chrome");
    expect(browserName(SAFARI_IPHONE)).toBe("Safari");
    expect(browserName(EDGE_DESKTOP)).toBe("Edge");
    expect(browserName(FIREFOX_MAC)).toBe("Firefox");
    expect(browserName(SAMSUNG)).toBe("Samsung Internet");
  });
});
