/** Payload builders for the free static tools. */

function escapeWifi(v: string): string {
  return v.replace(/([\\;,":])/g, "\\$1");
}

export function wifiPayload(opts: {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}): string {
  const { ssid, password, security, hidden } = opts;
  const parts = [
    `T:${security}`,
    `S:${escapeWifi(ssid)}`,
    security !== "nopass" ? `P:${escapeWifi(password)}` : "",
    hidden ? "H:true" : "",
  ].filter(Boolean);
  return `WIFI:${parts.join(";")};;`;
}

function escapeVcard(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");
}

export function vcardPayload(opts: {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
}): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcard(opts.lastName)};${escapeVcard(opts.firstName)};;;`,
    `FN:${escapeVcard([opts.firstName, opts.lastName].filter(Boolean).join(" "))}`,
    opts.organization ? `ORG:${escapeVcard(opts.organization)}` : "",
    opts.title ? `TITLE:${escapeVcard(opts.title)}` : "",
    opts.phone ? `TEL;TYPE=CELL:${escapeVcard(opts.phone)}` : "",
    opts.email ? `EMAIL:${escapeVcard(opts.email)}` : "",
    opts.website ? `URL:${escapeVcard(opts.website)}` : "",
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\r\n");
}

/** mailto: link that opens a new email with the fields filled in. */
export function emailPayload(opts: {
  to: string;
  subject?: string;
  body?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.subject) params.set("subject", opts.subject);
  if (opts.body) params.set("body", opts.body);
  // URLSearchParams writes spaces as "+", which some mail apps show literally.
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${opts.to.trim()}${query ? `?${query}` : ""}`;
}

function cleanPhone(v: string): string {
  return v.replace(/[^\d+]/g, "");
}

/** SMSTO: payload. iPhone and Android cameras open Messages with it filled in. */
export function smsPayload(opts: { number: string; message?: string }): string {
  const n = cleanPhone(opts.number);
  return opts.message ? `SMSTO:${n}:${opts.message}` : `SMSTO:${n}`;
}

/** tel: payload. Scanning offers to call the number. */
export function phonePayload(number: string): string {
  return `tel:${cleanPhone(number)}`;
}
