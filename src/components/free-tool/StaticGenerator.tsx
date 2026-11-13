"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { QRPreview } from "@/components/qr/QRPreview";
import { DesignControls } from "@/components/qr/DesignControls";
import { track } from "@vercel/analytics";
import { downloadPng, downloadSvg } from "@/components/qr/download";
import { wifiPayload, vcardPayload } from "@/lib/qr/payloads";
import { isScannableCombo } from "@/lib/qr/contrast";
import { Button, Input, Label, Card } from "@/components/ui";
import type { QRDesign } from "@/lib/validate";

export type GeneratorMode = "url" | "text" | "wifi" | "vcard";

const MODES: Array<{ id: GeneratorMode; label: string }> = [
  { id: "url", label: "Link" },
  { id: "text", label: "Text" },
  { id: "wifi", label: "WiFi" },
  { id: "vcard", label: "Contact" },
];

const MAX_LEN = 1600;
const EXAMPLE = "https://www.scanstone.ca";
const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function StaticGenerator({
  initialMode = "url",
}: {
  initialMode?: GeneratorMode;
}) {
  // Prevent input before React has attached handlers; otherwise a fast mobile
  // interaction can change the DOM value without updating the QR payload.
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientReady,
    serverReady,
  );
  const [mode, setMode] = useState<GeneratorMode>(initialMode);
  const [design, setDesign] = useState<QRDesign>({
    fg: "#1c1917",
    bg: "#ffffff",
    shape: "square",
  });

  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState({
    ssid: "",
    password: "",
    security: "WPA" as const,
  });
  const [vcard, setVcard] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    phone: "",
    email: "",
    website: "",
  });
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const payload = useMemo(() => {
    try {
      switch (mode) {
        case "url": {
          const v = url.trim();
          if (!v) return "";
          return /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`;
        }
        case "text":
          return text.trim();
        case "wifi":
          return wifi.ssid ? wifiPayload(wifi) : "";
        case "vcard":
          return vcard.firstName || vcard.lastName ? vcardPayload(vcard) : "";
      }
    } catch {
      return "";
    }
  }, [mode, url, text, wifi, vcard]);

  const tooLong = payload.length > MAX_LEN;
  const scannable = isScannableCombo(design.fg, design.bg);
  const ready = payload.length > 0 && !tooLong && scannable;
  // Re-carve animation: settles 250ms after the last keystroke.
  const [carveKey, setCarveKey] = useState("example");
  useEffect(() => {
    const t = setTimeout(() => setCarveKey(ready ? payload : "example"), 250);
    return () => clearTimeout(t);
  }, [ready, payload]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
      <fieldset
        disabled={!hydrated}
        aria-busy={!hydrated}
        aria-label="QR code content and design"
        className="min-w-0 space-y-7 self-start rounded-[28px] border border-line bg-paper p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] sm:p-8"
      >
        <noscript>
          Enable JavaScript to create a QR code in your browser.
        </noscript>
        <div
          role="tablist"
          aria-label="QR content type"
          className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-paper p-1"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                mode === m.id
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "url" ? (
          <div>
            <Label htmlFor="gen-url">Destination link</Label>
            <Input
              id="gen-url"
              type="url"
              inputMode="url"
              placeholder="https://example.com/menu"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>
        ) : null}

        {mode === "text" ? (
          <div>
            <Label htmlFor="gen-text">Text</Label>
            <textarea
              id="gen-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={MAX_LEN}
              placeholder="Any text: a message, a serial number, a note"
              className="w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-verdigris"
            />
          </div>
        ) : null}

        {mode === "wifi" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="wifi-ssid">Network name (SSID)</Label>
              <Input
                id="wifi-ssid"
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                placeholder="CafeGuest"
              />
            </div>
            <div>
              <Label htmlFor="wifi-pass">Password</Label>
              <Input
                id="wifi-pass"
                value={wifi.password}
                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                placeholder="Leave empty for open networks"
              />
            </div>
            <p className="text-xs text-ink-faint sm:col-span-2">
              Guests point their camera and join. No typing. The password is
              embedded in the code itself and never sent to us.
            </p>
          </div>
        ) : null}

        {mode === "vcard" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="vc-first">First name</Label>
              <Input
                id="vc-first"
                value={vcard.firstName}
                onChange={(e) =>
                  setVcard({ ...vcard, firstName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="vc-last">Last name</Label>
              <Input
                id="vc-last"
                value={vcard.lastName}
                onChange={(e) =>
                  setVcard({ ...vcard, lastName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="vc-org">Company</Label>
              <Input
                id="vc-org"
                value={vcard.organization}
                onChange={(e) =>
                  setVcard({ ...vcard, organization: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="vc-phone">Phone</Label>
              <Input
                id="vc-phone"
                type="tel"
                value={vcard.phone}
                onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vc-email">Email</Label>
              <Input
                id="vc-email"
                type="email"
                value={vcard.email}
                onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vc-web">Website</Label>
              <Input
                id="vc-web"
                type="url"
                value={vcard.website}
                onChange={(e) =>
                  setVcard({ ...vcard, website: e.target.value })
                }
              />
            </div>
          </div>
        ) : null}

        {tooLong ? (
          <p role="alert" className="text-sm text-danger">
            That&apos;s too much content for a reliable QR code. Shorten it
            below {MAX_LEN} characters.
          </p>
        ) : null}

        <DesignControls design={design} onChange={setDesign} />
      </fieldset>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="!rounded-[28px] !bg-paper p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow text-ink-faint">Your code</p>
            <p
              className={`eyebrow ${ready ? "text-verdigris" : "text-ink-faint"}`}
              aria-live="polite"
            >
              {ready ? "Ready to download" : "Example"}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-paper-deep/60 p-5 sm:p-7">
            <div key={carveKey} className="qr-recarve">
            <QRPreview
              data={ready ? payload : EXAMPLE}
              options={design}
              className={`!rounded-xl transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-25 blur-[3px] grayscale"}`}
            />
            </div>
            {!ready ? (
              <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-medium text-ink">
                <span className="gen-wait inline-flex items-center gap-2.5 rounded-full bg-paper/95 px-4 py-2 shadow-[var(--shadow-card)]">
                  <span aria-hidden="true" className="gen-wait-dot h-2 w-2 shrink-0 rounded-full bg-verdigris" />
                  Type above and your code appears here
                </span>
              </p>
            ) : null}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button
              type="button"
              className="!rounded-full py-3"
              disabled={!ready}
              onClick={async () => {
                setDownloadError(null);
                try {
                  await downloadPng(payload, design, "scanstone-qr");
                  track("qr_downloaded", { format: "png", mode });
                } catch {
                  setDownloadError("Download failed. Try another browser.");
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
                setDownloadError(null);
                try {
                  downloadSvg(payload, design, "scanstone-qr");
                  track("qr_downloaded", { format: "svg", mode });
                } catch {
                  setDownloadError("Download failed. Try another browser.");
                }
              }}
            >
              SVG
            </Button>
          </div>
          {downloadError ? (
            <p role="alert" className="mt-2 text-center text-xs text-danger">
              {downloadError}
            </p>
          ) : null}
          <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
            Free forever, no account, no watermark. This code holds your link
            itself, with nothing in between, so there&apos;s nothing for us to
            switch off. Scan it and your phone shows your own link, not ours.
          </p>
        </Card>

        {mode === "url" ? (
          <Card className="mt-4 !rounded-[22px] border-verdigris/30 bg-verdigris/5 p-5">
            <p className="text-sm leading-relaxed text-ink">
              <strong>Printing this?</strong>{" "}A static code can&apos;t be edited
              later. A{" "}
              <Link
                href="/signup"
                className="font-medium text-verdigris-deep underline"
              >
                dynamic code
              </Link>{" "}
              lets you change the destination after printing and counts your
              scans, and it keeps redirecting even if you cancel. 3 free.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
