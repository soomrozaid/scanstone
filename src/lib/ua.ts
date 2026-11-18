/** Coarse, privacy-preserving device and browser classification. No fingerprinting. */

export type DeviceType = "desktop" | "phone" | "tablet" | "unknown";

export type ClassifiedUserAgent = {
  /** Legacy scan field: desktop, tablet, mobile, bot, or unknown. */
  device: string;
  os: string;
  /** Generation-events field: desktop, phone, tablet, or unknown. */
  deviceType: DeviceType;
  browser: string;
};

export function classifyUserAgent(ua: string | null): ClassifiedUserAgent {
  if (!ua) {
    return { device: "unknown", os: "unknown", deviceType: "unknown", browser: "other" };
  }
  const s = ua.toLowerCase();

  let os = "other";
  if (/iphone|ipad|ipod/.test(s)) os = "ios";
  else if (/android/.test(s)) os = "android";
  else if (/windows/.test(s)) os = "windows";
  else if (/mac os x|macintosh/.test(s)) os = "macos";
  else if (/linux/.test(s)) os = "linux";

  let device = "desktop";
  if (/bot|crawler|spider|preview|fetch|curl|wget/.test(s)) device = "bot";
  else if (/ipad|tablet|(android(?!.*mobile))/.test(s)) device = "tablet";
  else if (/mobile|iphone|ipod|android/.test(s)) device = "mobile";

  let deviceType: DeviceType = "unknown";
  if (device === "desktop") deviceType = "desktop";
  else if (device === "tablet") deviceType = "tablet";
  else if (device === "mobile") deviceType = "phone";
  else deviceType = "unknown";

  return { device, os, deviceType, browser: browserName(ua) };
}

/** Browser family name only. Order matters because Chrome tokens appear in other UAs. */
export function browserName(ua: string | null): string {
  if (!ua) return "other";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Edg(?:e|A|iOS)?\/|EdgiOS/i.test(ua)) return "Edge";
  if (/Firefox\/|FxiOS\//i.test(ua)) return "Firefox";
  if (/OPR\/|Opera\//i.test(ua)) return "Opera";
  if (/Chrome\/|CriOS\/|Chromium\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome|Chromium|CriOS|Android/i.test(ua)) return "Safari";
  return "other";
}
