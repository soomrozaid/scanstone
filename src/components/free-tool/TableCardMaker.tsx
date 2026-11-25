"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Button, Card, Input, Label } from "@/components/ui";
import { useStaticGenerationEvents } from "@/lib/generation-client";
import { MAX_TABLES, parseTables, renderTableCardSvg, tableLabel } from "@/lib/qr/table-card";

const MAX_LEN = 600;
const EXAMPLE = "https://www.yourcafe.ca/menu";
const subscribe = () => () => {};

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function svgToPng(svg: string): Promise<Blob> {
  const src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("rasterize failed"));
      img.src = src;
    });
    // 4 x 6 in at 300 dpi
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(img, 0, 0, 1200, 1800);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (!blob) throw new Error("png failed");
    return blob;
  } finally {
    URL.revokeObjectURL(src);
  }
}

/** Prints every card, two 4 x 6 in cards per letter-size page, through a hidden frame. */
function printCards(svgs: string[]) {
  const pages: string[] = [];
  for (let i = 0; i < svgs.length; i += 2) {
    pages.push(`<div class="sheet">${svgs.slice(i, i + 2).join("")}</div>`);
  }
  const html =
    `<!doctype html><html><head><meta charset="utf-8"><title>Scanstone table cards</title><style>` +
    `@page{size:letter landscape;margin:0.4in}html,body{margin:0}` +
    `.sheet{display:flex;gap:0.6in;justify-content:center;align-items:flex-start;break-after:page;page-break-after:always}` +
    `.sheet:last-child{break-after:auto;page-break-after:auto}.sheet>svg{width:4in;height:6in;flex:none}` +
    `</style></head><body>${pages.join("")}</body></html>`;
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    throw new Error("print unavailable");
  }
  doc.open();
  doc.write(html);
  doc.close();
  win.focus();
  setTimeout(() => {
    win.print();
    setTimeout(() => frame.remove(), 60_000);
  }, 150);
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Free, in-browser maker for printable 4 x 6 in menu table cards. */
export function TableCardMaker() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [url, setUrl] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [headline, setHeadline] = useState("Scan for our menu");
  const [note, setNote] = useState("Prefer a paper menu? Just ask.");
  const [showLink, setShowLink] = useState(true);
  const [tablesInput, setTablesInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => {
    const v = url.trim();
    if (!v) return "";
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`;
  }, [url]);
  const tooLong = payload.length > MAX_LEN;
  const ready = payload.length > 0 && !tooLong;
  const tables = useMemo(() => parseTables(tablesInput), [tablesInput]);
  const { recordDownload } = useStaticGenerationEvents(payload, ready);

  const card = (table?: string) =>
    renderTableCardSvg({ data: ready ? payload : EXAMPLE, restaurant, headline, note, showLink, table });
  const preview = card(tables[0]);
  const count = Math.max(1, tables.length);
  const fileBase = `table-card${restaurant ? `-${slug(restaurant)}` : ""}${tables[0] ? `-${slug(tables[0])}` : ""}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
      <fieldset
        disabled={!hydrated}
        aria-busy={!hydrated}
        aria-label="Table card details"
        className="min-w-0 space-y-6 self-start rounded-[28px] border border-line bg-paper p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] sm:p-8"
      >
        <noscript>Enable JavaScript to make table cards in your browser.</noscript>
        <div>
          <Label htmlFor="tc-url">Menu link</Label>
          <Input
            id="tc-url"
            type="text"
            autoComplete="url"
            spellCheck={false}
            inputMode="url"
            placeholder="yourcafe.ca/menu or a PDF link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-faint">
            Your menu page, a public PDF, or a scst.one short link from a{" "}
            <Link href="/signup" className="text-verdigris-deep underline">
              free dynamic code
            </Link>{" "}
            if you want to change the menu link later without reprinting.
          </p>
          {tooLong ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              That link is too long for a table card. Use a shorter link.
            </p>
          ) : null}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="tc-name">Restaurant name (optional)</Label>
            <Input id="tc-name" maxLength={60} value={restaurant} onChange={(e) => setRestaurant(e.target.value)} placeholder="Corner Cafe" />
          </div>
          <div>
            <Label htmlFor="tc-head">Headline</Label>
            <Input id="tc-head" maxLength={50} value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="tc-note">Small print (optional)</Label>
          <Input id="tc-note" maxLength={80} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="tc-tables">Table numbers (optional)</Label>
          <Input
            id="tc-tables"
            value={tablesInput}
            onChange={(e) => setTablesInput(e.target.value)}
            placeholder="1-12, Bar, Patio 1-4"
          />
          <p className="mt-2 text-xs text-ink-faint" aria-live="polite">
            {tables.length
              ? `${tables.length} card${tables.length === 1 ? "" : "s"}: ${tables.slice(0, 4).map(tableLabel).join(", ")}${tables.length > 4 ? ` and ${tables.length - 4} more` : ""}. Every card opens the same menu.`
              : `One card per table, up to ${MAX_TABLES}. Leave empty for one card with no number.`}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 accent-verdigris"
            checked={showLink}
            onChange={(e) => setShowLink(e.target.checked)}
          />
          Print the link under the code, for guests who can&apos;t scan
        </label>
      </fieldset>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="!rounded-[28px] !bg-paper p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow text-ink-faint">Your card, 4 × 6 in</p>
            <p className={`eyebrow ${ready ? "text-verdigris" : "text-ink-faint"}`} aria-live="polite">
              {ready ? "Ready" : "Example"}
            </p>
          </div>
          <div className="rounded-2xl bg-paper-deep/60 p-4">
            <div
              className={`mx-auto w-full max-w-[280px] overflow-hidden rounded-xl shadow-[var(--shadow-card)] [&>svg]:h-auto [&>svg]:w-full ${ready ? "" : "opacity-40"}`}
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
          <div className="mt-5 grid gap-2">
            <Button
              type="button"
              className="!rounded-full py-3"
              disabled={!ready}
              onClick={() => {
                setError(null);
                try {
                  printCards((tables.length ? tables : [undefined]).map((t) => card(t)));
                  recordDownload();
                  track("table_cards_printed", { cards: count });
                } catch {
                  setError("Printing didn't start. Try another browser, or download the card below.");
                }
              }}
            >
              Print {count > 1 ? `${count} cards` : "card"} (or save as PDF)
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="ghost"
                className="!rounded-full py-3"
                disabled={!ready}
                onClick={async () => {
                  setError(null);
                  try {
                    const blob = await svgToPng(preview);
                    const u = URL.createObjectURL(blob);
                    download(u, `${fileBase}.png`);
                    URL.revokeObjectURL(u);
                    recordDownload();
                    track("table_card_downloaded", { format: "png" });
                  } catch {
                    setError("Download failed. Try another browser.");
                  }
                }}
              >
                PNG
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="!rounded-full py-3"
                disabled={!ready}
                onClick={() => {
                  setError(null);
                  const u = URL.createObjectURL(new Blob([preview], { type: "image/svg+xml" }));
                  download(u, `${fileBase}.svg`);
                  URL.revokeObjectURL(u);
                  recordDownload();
                  track("table_card_downloaded", { format: "svg" });
                }}
              >
                SVG
              </Button>
            </div>
          </div>
          {error ? (
            <p role="alert" className="mt-2 text-center text-xs text-danger">
              {error}
            </p>
          ) : null}
          <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
            Free, no account, no watermark. Made in your browser. Two cards fit
            on a letter page; PNG and SVG download the card shown{tables.length > 1 ? " (the first table)" : ""}.
            Scan a test print before you print the rest.
          </p>
        </Card>
      </div>
    </div>
  );
}
