import { renderQRSvg } from "./svg";
import { esc, fit } from "./table-card";
import { wifiPayload } from "./payloads";

export interface WifiCardInput {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
  /** Café, rental or office name shown above the headline. */
  place?: string;
  headline?: string;
  /** Write the password under the code, for laptops and TVs that can't scan. */
  showPassword?: boolean;
  /** Small line at the bottom. */
  note?: string;
}

export const DEFAULT_WIFI_HEADLINE = "Scan to join our WiFi";
export const DEFAULT_WIFI_NOTE =
  "Point your phone camera at the code, then tap Join.";

const W = 400; // 4 in at 100 units per inch
const H = 600; // 6 in
const FONT = "Helvetica, Arial, sans-serif";
const MONO = "Menlo, Consolas, 'Courier New', monospace";
const INK = "#1c1917";
const SOFT = "#57534e";

/** The same WIFI: payload the generator makes; no password means an open network. */
export function wifiCardPayload(input: WifiCardInput): string {
  return wifiPayload({
    ssid: input.ssid,
    password: input.password,
    security: input.password ? input.security : "nopass",
    hidden: input.hidden,
  });
}

/** A 4 x 6 inch "scan to join" WiFi sign: headline, code, network name, optional password, note. */
export function renderWifiCardSvg(input: WifiCardInput): string {
  const place = input.place?.trim() ?? "";
  const headline = input.headline?.trim() || DEFAULT_WIFI_HEADLINE;
  const note = input.note?.trim() ?? "";
  const open = !input.password || input.security === "nopass";
  const lh = (size: number) => Math.round(size * 1.18);

  type Line = {
    text: string;
    size: number;
    weight?: number;
    fill?: string;
    font?: string;
    spacing?: number;
    italic?: boolean;
    gapBefore: number;
  };
  const top: Line[] = [];
  if (place) {
    const r = fit(place, 24, 15, 2);
    r.lines.forEach((t) =>
      top.push({ text: t, size: r.size, fill: SOFT, gapBefore: 0 }),
    );
  }
  const h = fit(headline, 34, 20, 2);
  h.lines.forEach((t, i) =>
    top.push({
      text: t,
      size: h.size,
      weight: 700,
      gapBefore: i === 0 && place ? 8 : 0,
    }),
  );

  const bottom: Line[] = [];
  const label = (t: string, gap: number) =>
    bottom.push({
      text: t,
      size: 12,
      weight: 700,
      fill: SOFT,
      spacing: 2,
      gapBefore: gap,
    });
  label("NETWORK", 14);
  const s = fit(input.ssid, 22, 13, 2, 0.6);
  s.lines.forEach((t, i) =>
    bottom.push({ text: t, size: s.size, weight: 700, gapBefore: i ? 0 : 4 }),
  );
  if (open) {
    bottom.push({
      text: "No password needed",
      size: 15,
      fill: SOFT,
      gapBefore: 10,
    });
  } else if (input.showPassword !== false) {
    label("PASSWORD", 10);
    const p = fit(input.password, 21, 11, 2, 0.62);
    p.lines.forEach((t, i) =>
      bottom.push({ text: t, size: p.size, font: MONO, gapBefore: i ? 0 : 4 }),
    );
  }

  const height = (ls: Line[]) =>
    ls.reduce((a, l) => a + l.gapBefore + lh(l.size), 0);
  const noteFit = note ? fit(note, 14, 10, 2) : null;
  const noteH = noteFit ? lh(noteFit.size) * noteFit.lines.length + 14 : 0;

  const margin = 26;
  const avail = H - margin * 2 - height(top) - height(bottom) - noteH - 14;
  const qrSize = Math.max(170, Math.min(270, avail));
  const used = height(top) + 14 + qrSize + height(bottom) + noteH;
  let y = margin + Math.max(0, Math.floor((H - margin * 2 - used) / 2));

  const parts: string[] = [];
  const draw = (l: Line) => {
    y += l.gapBefore;
    const base = y + l.size;
    parts.push(
      `<text x="${W / 2}" y="${base}" text-anchor="middle" font-family="${l.font ?? FONT}" font-size="${l.size}"` +
        (l.weight ? ` font-weight="${l.weight}"` : "") +
        (l.italic ? ` font-style="italic"` : "") +
        (l.spacing ? ` letter-spacing="${l.spacing}"` : "") +
        ` fill="${l.fill ?? INK}">${esc(l.text)}</text>`,
    );
    y += lh(l.size);
  };
  top.forEach(draw);
  y += 14;
  const qrX = (W - qrSize) / 2;
  parts.push(
    renderQRSvg(wifiCardPayload(input), {
      fg: INK,
      bg: "#ffffff",
      quietZone: 3,
    }).replace(
      "<svg ",
      `<svg x="${qrX}" y="${y}" width="${qrSize}" height="${qrSize}" `,
    ),
  );
  y += qrSize;
  bottom.forEach(draw);
  if (noteFit) {
    y += 14;
    noteFit.lines.forEach((t) =>
      draw({
        text: t,
        size: noteFit.size,
        italic: true,
        fill: SOFT,
        gapBefore: 0,
      }),
    );
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="4in" height="6in" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(
      `WiFi sign: ${headline}`,
    )}">` +
    `<rect width="${W}" height="${H}" fill="#ffffff"/>` +
    `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="14" fill="none" stroke="#d6d3d1" stroke-width="1.5"/>` +
    parts.join("") +
    `</svg>`
  );
}
