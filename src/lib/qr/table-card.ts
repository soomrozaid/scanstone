import { renderQRSvg } from "./svg";

/** Most cards one print run can hold; keeps the print sheet quick to build. */
export const MAX_TABLES = 100;

export interface TableCardInput {
  /** What the QR code holds, normally the menu link. */
  data: string;
  restaurant?: string;
  headline?: string;
  /** Small line at the bottom, e.g. "Prefer a paper menu? Just ask." */
  note?: string;
  /** Print the link under the code for guests who can't scan. */
  showLink?: boolean;
  /** Table label, e.g. "4", "Bar" or "Patio 2". */
  table?: string;
}

const W = 400; // 4 in at 100 units per inch
const H = 600; // 6 in
const TEXT_W = 340;
const FONT = "Helvetica, Arial, sans-serif";
const INK = "#1c1917";
const SOFT = "#57534e";

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** The link as a person would type it: no https://, no trailing slash. */
export function displayLink(data: string): string {
  return data.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/** Split text into at most maxLines lines of about `chars` characters. Long words are broken. */
function wrap(text: string, chars: number, maxLines: number): string[] | null {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (let w of words) {
    while (w.length > chars) {
      if (line) {
        lines.push(line);
        line = "";
      }
      lines.push(w.slice(0, chars));
      w = w.slice(chars);
    }
    const next = line ? `${line} ${w}` : w;
    if (next.length > chars) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length <= maxLines ? lines : null;
}

/** Largest font size (between max and min) at which the text fits in maxLines. */
export function fit(
  text: string,
  maxSize: number,
  minSize: number,
  maxLines: number,
  widthRatio = 0.56,
): { lines: string[]; size: number } {
  for (let size = maxSize; size >= minSize; size -= 1) {
    const lines = wrap(text, Math.floor(TEXT_W / (size * widthRatio)), maxLines);
    if (lines) return { lines, size };
  }
  const chars = Math.floor(TEXT_W / (minSize * widthRatio));
  const all = wrap(text, chars, 99) ?? [text];
  const lines = all.slice(0, maxLines);
  if (all.length > maxLines) lines[maxLines - 1] = `${lines[maxLines - 1]!.slice(0, chars - 1)}…`;
  return { lines, size: minSize };
}

/** "4" becomes "Table 4"; anything with letters ("Bar", "Patio 2") is kept as typed. */
export function tableLabel(t: string): string {
  const v = t.trim();
  return /^\d+$/.test(v) ? `Table ${v}` : v;
}

/**
 * Parse "1-12, Bar, Patio 1-4" into ["1", ..., "12", "Bar", "Patio 1", ..., "Patio 4"].
 * Stops at MAX_TABLES labels.
 */
export function parseTables(input: string): string[] {
  const out: string[] = [];
  for (const raw of input.split(/[,;\n]/)) {
    const part = raw.trim();
    if (!part) continue;
    const m = part.match(/^(.*?)(\d+)\s*[-–]\s*(\d+)$/);
    if (m) {
      const prefix = m[1]!.trim();
      const a = Number(m[2]);
      const b = Number(m[3]);
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      for (let n = lo; n <= hi && out.length < MAX_TABLES; n++) {
        out.push(prefix ? `${prefix} ${n}` : String(n));
      }
    } else {
      out.push(part.slice(0, 24));
    }
    if (out.length >= MAX_TABLES) break;
  }
  return out.slice(0, MAX_TABLES);
}

/** A 4 x 6 inch table card: optional table label and name, headline, QR code, link and a small note. */
export function renderTableCardSvg(input: TableCardInput): string {
  const restaurant = input.restaurant?.trim() ?? "";
  const headline = input.headline?.trim() || "Scan for our menu";
  const note = input.note?.trim() ?? "";
  const table = input.table?.trim() ?? "";
  const link = input.showLink === false ? "" : displayLink(input.data);

  const parts: string[] = [];
  const text = (
    lines: string[],
    size: number,
    y: number,
    opts: { weight?: number; fill?: string; spacing?: number; italic?: boolean } = {},
  ) => {
    const lh = Math.round(size * 1.18);
    lines.forEach((l, i) => {
      parts.push(
        `<text x="${W / 2}" y="${y + i * lh}" text-anchor="middle" font-family="${FONT}" font-size="${size}"` +
          (opts.weight ? ` font-weight="${opts.weight}"` : "") +
          (opts.italic ? ` font-style="italic"` : "") +
          (opts.spacing ? ` letter-spacing="${opts.spacing}"` : "") +
          ` fill="${opts.fill ?? INK}">${esc(l)}</text>`,
      );
    });
    return lh * lines.length;
  };

  let y = 34;
  if (table) {
    const t = fit(tableLabel(table).toUpperCase(), 17, 12, 1, 0.68);
    y += t.size;
    text(t.lines, t.size, y, { weight: 700, fill: SOFT, spacing: 2 });
    y += 10;
  }
  if (restaurant) {
    const r = fit(restaurant, 26, 16, 2);
    y += r.size;
    y += text(r.lines, r.size, y, { weight: 400, fill: SOFT }) - Math.round(r.size * 1.18);
    y += 10;
  }
  const h = fit(headline, 36, 20, 2);
  y += h.size;
  y += text(h.lines, h.size, y, { weight: 700 }) - Math.round(h.size * 1.18);
  y += 16;

  const linkFit = link ? fit(link, 16, 10, 2, 0.55) : null;
  const noteFit = note ? fit(note, 15, 11, 2) : null;
  const linkH = linkFit ? Math.round(linkFit.size * 1.18) * linkFit.lines.length + 12 : 0;
  const noteH = noteFit ? Math.round(noteFit.size * 1.18) * noteFit.lines.length + 14 : 0;
  const bottom = H - 30;
  const qrSize = Math.max(180, Math.min(290, bottom - y - linkH - noteH));
  const qrX = (W - qrSize) / 2;

  const qr = renderQRSvg(input.data, { fg: INK, bg: "#ffffff", quietZone: 3 }).replace(
    "<svg ",
    `<svg x="${qrX}" y="${y}" width="${qrSize}" height="${qrSize}" `,
  );
  parts.push(qr);
  y += qrSize;

  if (linkFit) {
    y += 12 + linkFit.size;
    y += text(linkFit.lines, linkFit.size, y, { fill: INK }) - Math.round(linkFit.size * 1.18);
  }
  // Centre the main block in whatever space is left above the note.
  const noteTop = noteFit
    ? bottom - Math.round(noteFit.size * 1.18) * (noteFit.lines.length - 1) - noteFit.size
    : bottom;
  const shift = Math.max(0, Math.floor((noteTop - 14 - y) / 2));
  const main = `<g transform="translate(0 ${shift})">${parts.join("")}</g>`;
  parts.length = 0;
  if (noteFit) {
    const top = Math.max(y + shift + 14 + noteFit.size, bottom - Math.round(noteFit.size * 1.18) * (noteFit.lines.length - 1));
    text(noteFit.lines, noteFit.size, top, { italic: true, fill: SOFT });
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="4in" height="6in" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(
      `Table card: ${headline}`,
    )}">` +
    `<rect width="${W}" height="${H}" fill="#ffffff"/>` +
    `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="14" fill="none" stroke="#d6d3d1" stroke-width="1.5"/>` +
    main +
    parts.join("") +
    `</svg>`
  );
}
