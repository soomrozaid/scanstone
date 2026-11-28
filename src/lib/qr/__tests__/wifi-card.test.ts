import { describe, expect, it } from "vitest";
import { Resvg } from "@resvg/resvg-js";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { renderWifiCardSvg, wifiCardPayload } from "../wifi-card";

function decode(svg: string): string | null {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 800 } }).render().asPng();
  const { data, width, height } = PNG.sync.read(Buffer.from(png));
  return jsQR(new Uint8ClampedArray(data), width, height)?.data ?? null;
}

describe("WiFi signs", () => {
  it("renders a sign whose code joins the network, with the name and password written out", () => {
    const input = { ssid: "Corner Cafe Guest", password: "tulip;crisp:47", security: "WPA" as const, place: "Corner Cafe" };
    const svg = renderWifiCardSvg(input);
    expect(svg).toContain('width="4in"');
    expect(svg).toContain("Scan to join our WiFi");
    expect(svg).toContain("Corner Cafe Guest");
    expect(svg).toContain("tulip;crisp:47");
    expect(decode(svg)).toBe("WIFI:T:WPA;S:Corner Cafe Guest;P:tulip\\;crisp\\:47;;");
  });

  it("can leave the password off the sign but keeps it in the code", () => {
    const input = { ssid: "Office", password: "s3cret-pass", security: "WPA" as const, showPassword: false };
    const svg = renderWifiCardSvg(input);
    expect(svg).not.toContain("s3cret-pass");
    expect(svg).not.toContain("PASSWORD");
    expect(decode(svg)).toBe(wifiCardPayload(input));
  });

  it("says no password is needed on an open network", () => {
    const svg = renderWifiCardSvg({ ssid: "Library", password: "", security: "WPA" });
    expect(svg).toContain("No password needed");
    expect(decode(svg)).toBe("WIFI:T:nopass;S:Library;;");
  });

  it("still scans with long text and a hidden network", () => {
    const input = {
      ssid: "The Extremely Long Network Name For The Second Floor Boardroom",
      password: "a-very-long-password-that-someone-picked-to-be-safe-2026",
      security: "WPA" as const,
      hidden: true,
      place: "The Extremely Long Name Bistro and Wine Bar of Downtown Saskatoon",
      headline: "Free WiFi for guests, scan the code below to join",
      note: "Not connecting? Ask at the front desk and we will help you get online.",
    };
    const svg = renderWifiCardSvg(input);
    expect(decode(svg)).toBe(wifiCardPayload(input));
  });

  it("escapes markup in what people type", () => {
    const svg = renderWifiCardSvg({ ssid: "<b>Net</b>", password: "a&b", security: "WPA" });
    expect(svg).toContain("&lt;b&gt;Net&lt;/b&gt;");
    expect(svg).toContain("a&amp;b");
  });
});
