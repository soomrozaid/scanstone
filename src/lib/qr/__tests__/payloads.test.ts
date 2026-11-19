import { describe, expect, it } from "vitest";
import { emailPayload, phonePayload, smsPayload, wifiPayload } from "../payloads";

describe("static payloads", () => {
  it("builds a mailto link with encoded spaces", () => {
    expect(emailPayload({ to: "hi@example.com", subject: "Table 4", body: "Hello there" })).toBe(
      "mailto:hi@example.com?subject=Table%204&body=Hello%20there",
    );
    expect(emailPayload({ to: " hi@example.com " })).toBe("mailto:hi@example.com");
  });

  it("builds SMSTO and tel payloads with cleaned numbers", () => {
    expect(smsPayload({ number: "+1 (306) 555-0123", message: "Book me in" })).toBe(
      "SMSTO:+13065550123:Book me in",
    );
    expect(smsPayload({ number: "306 555 0123" })).toBe("SMSTO:3065550123");
    expect(phonePayload("+1 306-555-0123")).toBe("tel:+13065550123");
  });

  it("escapes WiFi special characters", () => {
    expect(wifiPayload({ ssid: "Cafe;Guest", password: "a:b", security: "WPA" })).toBe(
      "WIFI:T:WPA;S:Cafe\\;Guest;P:a\\:b;;",
    );
  });
});
