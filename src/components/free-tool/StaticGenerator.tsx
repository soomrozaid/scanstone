"use client";

import { Suspense, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { QRPreview } from "@/components/qr/QRPreview";
import { DesignControls } from "@/components/qr/DesignControls";
import { track } from "@vercel/analytics";
import { downloadPng, downloadSvg } from "@/components/qr/download";
import { useStaticGenerationEvents } from "@/lib/generation-client";
import {
  EMPTY_STATIC_VALUES,
  STATIC_KIND_LABELS,
  StaticFields,
  staticPayload,
  type StaticKind,
  type StaticValues,
} from "@/components/qr/StaticFields";
import { isScannableCombo } from "@/lib/qr/contrast";
import { Button, Input, Label, Card } from "@/components/ui";
import type { QRDesign } from "@/lib/validate";
import { WifiSignPanel } from "./WifiSignPanel";

export type GeneratorMode = "url" | StaticKind;

const MODES: Array<{ id: GeneratorMode; label: string }> = [
  { id: "url", label: "Link" },
  ...(["wifi", "vcard", "text", "email", "sms", "phone"] as const).map((id) => ({
    id,
    label: STATIC_KIND_LABELS[id],
  })),
];

const isMode = (v: string | null): v is GeneratorMode =>
  MODES.some((m) => m.id === v);

/** Follows ?type= in the address bar, so footer and chip links can open a type directly. */
function TypeFromQuery({ onType }: { onType: (m: GeneratorMode) => void }) {
  const type = useSearchParams().get("type");
  useEffect(() => {
    onType(isMode(type) ? type : "url");
  }, [type, onType]);
  return null;
}

const MAX_LEN = 1600;
const EXAMPLE = "https://www.scanstone.ca";
const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function StaticGenerator({
  initialMode = "url",
  variant = "public",
  syncTypeParam = false,
}: {
  initialMode?: GeneratorMode;
  /** Read and write ?type= so a link like /qr-code-generator?type=email opens that type. */
  syncTypeParam?: boolean;
  /** "dashboard": signed in, so skip the sign-up nudge and point to a dynamic code instead. */
  variant?: "public" | "dashboard";
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
  const [values, setValues] = useState<StaticValues>(EMPTY_STATIC_VALUES);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const payload = useMemo(() => {
    if (mode !== "url") return staticPayload(mode, values);
    const v = url.trim();
    if (!v) return "";
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`;
  }, [mode, url, values]);

  const tooLong = payload.length > MAX_LEN;
  const scannable = isScannableCombo(design.fg, design.bg);
  const ready = payload.length > 0 && !tooLong && scannable;
  const { recordDownload } = useStaticGenerationEvents(payload, ready);
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
        {syncTypeParam ? (
          <Suspense fallback={null}>
            <TypeFromQuery onType={setMode} />
          </Suspense>
        ) : null}
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
              onClick={() => {
                setMode(m.id);
                if (syncTypeParam) {
                  const u = new URL(window.location.href);
                  if (m.id === "url") u.searchParams.delete("type");
                  else u.searchParams.set("type", m.id);
                  window.history.replaceState(null, "", u);
                }
              }}
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

        {mode !== "url" ? (
          <StaticFields
            kind={mode}
            values={values}
            onChange={setValues}
            maxLength={MAX_LEN}
          />
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
                  recordDownload();
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
                  recordDownload();
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

        {mode === "wifi" ? (
          <WifiSignPanel wifi={values.wifi} ready={ready} onSaved={recordDownload} />
        ) : null}

        {mode === "url" && variant === "dashboard" ? (
          <Card className="mt-4 !rounded-[22px] border-verdigris/30 bg-verdigris/5 p-5">
            <p className="text-sm leading-relaxed text-ink">
              <strong>Printing this?</strong>{" "}A static code can&apos;t be edited
              later. Make it a{" "}
              <Link
                href={payload ? `/dashboard/new?url=${encodeURIComponent(payload)}` : "/dashboard/new"}
                className="font-medium text-verdigris-deep underline"
              >
                dynamic code
              </Link>{" "}
              if you might want to change where it points or count scans.
            </p>
          </Card>
        ) : null}
        {mode === "url" && variant === "public" ? (
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
