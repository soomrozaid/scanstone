"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { track } from "@vercel/analytics";
import { createShortUrl } from "@/app/(app)/dashboard/actions";
import { QRPreview } from "@/components/qr/QRPreview";
import { DesignControls } from "@/components/qr/DesignControls";
import { downloadPng, downloadSvg } from "@/components/qr/download";
import { Button, ButtonLink, Card, FieldError, Input } from "@/components/ui";
import { isScannableCombo } from "@/lib/qr/contrast";
import { validateDestinationUrl, type QRDesign } from "@/lib/validate";
import { rememberPendingDestination } from "@/lib/pending-destination";

const DEFAULT_DESIGN: QRDesign = {
  fg: "#1c1917",
  bg: "#ffffff",
  shape: "square",
};

const MAX_LEN = 1600;
const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

type Mode = "qr" | "link";

function normalizeStaticUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

function accountReturnPath(kind: "link" | "code", url: string): string {
  const path = kind === "link" ? "/dashboard/shorten" : "/dashboard/new";
  return `${path}?url=${encodeURIComponent(url)}`;
}

export function HomeTool({ signedIn }: { signedIn: boolean }) {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientReady,
    serverReady,
  );
  const [mode, setMode] = useState<Mode>("qr");
  const [url, setUrl] = useState("");
  const [design, setDesign] = useState<QRDesign>(DEFAULT_DESIGN);
  const [qrPayload, setQrPayload] = useState("");
  const [pendingLink, setPendingLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [linkState, linkAction, linkPending] = useActionState(
    createShortUrl,
    null,
  );

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash;
      if (hash === "#short-link" || hash === "#short-links") {
        setMode("link");
      } else if (hash === "#qr") {
        setMode("qr");
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const scannable = isScannableCombo(design.fg, design.bg);
  const qrReady =
    qrPayload.length > 0 && qrPayload.length <= MAX_LEN && scannable;

  const loginHref = useMemo(() => {
    if (!pendingLink) return "/login";
    return `/login?next=${encodeURIComponent(accountReturnPath("link", pendingLink))}`;
  }, [pendingLink]);

  function selectMode(next: Mode) {
    setMode(next);
    setError(null);
    setDownloadError(null);
    if (next === "qr") {
      history.replaceState(null, "", "#qr");
    } else {
      history.replaceState(null, "", "#short-link");
    }
  }

  function makeQr(raw: string = url) {
    setDownloadError(null);
    const payload = normalizeStaticUrl(raw);
    if (!payload) {
      setQrPayload("");
      setError("Enter a link first.");
      return false;
    }
    if (payload.length > MAX_LEN) {
      setQrPayload("");
      setError(
        `That link is too long for a reliable QR code. Keep it under ${MAX_LEN} characters.`,
      );
      return false;
    }
    setError(null);
    setQrPayload(payload);
    setPendingLink("");
    track("home_tool_used", { mode: "qr" });
    return true;
  }

  function startShortLink(raw: string = url) {
    const dest = validateDestinationUrl(raw);
    if (!dest.ok) {
      setPendingLink("");
      setError(dest.error);
      return false;
    }
    setError(null);
    setQrPayload("");
    setPendingLink(dest.url);
    rememberPendingDestination(dest.url, "link");
    track("home_tool_used", { mode: "link" });
    return true;
  }

  return (
    <section
      id="tool"
      data-testid="home-tool"
      className="mx-auto max-w-xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10"
    >
      <div id="short-link" className="scroll-mt-20" />
      <h1 className="engraved text-[1.75rem] font-semibold leading-tight sm:text-4xl">
        Make a QR code or a short link
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
        Paste a URL. Download a QR code right away, or save a short link you can
        edit later.
      </p>

      <Card className="mt-5 p-4 sm:p-6">
        <fieldset
          disabled={!hydrated}
          aria-busy={!hydrated}
          aria-label="QR code or short link tool"
        >
          <noscript>
            Enable JavaScript to use this tool in your browser, or use the{" "}
            <a href="/qr-code-generator" className="underline">
              free QR generator
            </a>
            .
          </noscript>
          <div
            role="tablist"
            aria-label="What to make"
            className="grid grid-cols-2 gap-2"
          >
            {(
              [
                { id: "qr", label: "QR code" },
                { id: "link", label: "Short link" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`home-tool-tab-${tab.id}`}
                aria-selected={mode === tab.id}
                aria-controls="home-tool-panel"
                onClick={() => selectMode(tab.id)}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  mode === tab.id
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-ink-soft hover:border-ink-faint"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            id="home-tool-panel"
            role="tabpanel"
            aria-labelledby={`home-tool-tab-${mode}`}
            className="mt-4"
          >
            {mode === "qr" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  makeQr();
                }}
                className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
              >
                <label htmlFor="home-tool-url" className="sr-only">
                  Destination link
                </label>
                <Input
                  id="home-tool-url"
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="example.com/menu"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  autoFocus
                  className="py-2.5"
                />
                <Button
                  type="submit"
                  variant="accent"
                  className="shrink-0 px-5 py-2.5 sm:min-w-40"
                >
                  Create QR code
                </Button>
              </form>
            ) : signedIn ? (
              <form
                action={linkAction}
                onSubmit={() => {
                  const dest = validateDestinationUrl(url);
                  if (dest.ok) rememberPendingDestination(dest.url, "link");
                }}
                className="space-y-2"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <label htmlFor="home-tool-url" className="sr-only">
                    Destination link
                  </label>
                  <Input
                    id="home-tool-url"
                    name="destination_url"
                    type="url"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="example.com/your-long-link"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    required
                    maxLength={2048}
                    className="py-2.5"
                  />
                  <Button
                    type="submit"
                    variant="accent"
                    className="shrink-0 px-5 py-2.5 sm:min-w-40"
                    disabled={linkPending}
                  >
                    {linkPending ? "Saving…" : "Create short link"}
                  </Button>
                </div>
                <FieldError>{linkState?.error}</FieldError>
              </form>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  startShortLink();
                }}
                className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
              >
                <label htmlFor="home-tool-url" className="sr-only">
                  Destination link
                </label>
                <Input
                  id="home-tool-url"
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="example.com/your-long-link"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="py-2.5"
                />
                <Button
                  type="submit"
                  variant="accent"
                  className="shrink-0 px-5 py-2.5 sm:min-w-40"
                >
                  Create short link
                </Button>
              </form>
            )}
          </div>
          <FieldError>{error}</FieldError>
        </fieldset>

        {mode === "qr" && qrReady ? (
          <div className="mt-6 border-t border-line pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
              Your QR code
            </p>
            <QRPreview
              data={qrPayload}
              options={design}
              className="mx-auto max-w-56"
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                onClick={async () => {
                  setDownloadError(null);
                  try {
                    await downloadPng(qrPayload, design, "scanstone-qr");
                    track("qr_downloaded", { format: "png", mode: "home" });
                  } catch {
                    setDownloadError("Download failed. Try another browser.");
                  }
                }}
              >
                Download PNG
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDownloadError(null);
                  try {
                    downloadSvg(qrPayload, design, "scanstone-qr");
                    track("qr_downloaded", { format: "svg", mode: "home" });
                  } catch {
                    setDownloadError("Download failed. Try another browser.");
                  }
                }}
              >
                Download SVG
              </Button>
            </div>
            {downloadError ? (
              <p role="alert" className="mt-2 text-center text-xs text-danger">
                {downloadError}
              </p>
            ) : null}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-ink-soft hover:text-ink">
                Customize colors
              </summary>
              <div className="mt-3">
                <DesignControls design={design} onChange={setDesign} />
              </div>
            </details>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              This code holds your link itself, with nothing in between, so it
              never expires.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Want to change where it points after you print it, or see how many
              people scan it?{" "}
              {signedIn ? (
                <Link
                  href={accountReturnPath("code", qrPayload)}
                  className="font-medium text-verdigris-deep underline underline-offset-4"
                  onClick={() => rememberPendingDestination(qrPayload, "code")}
                >
                  Save it as an editable code
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="font-medium text-verdigris-deep underline underline-offset-4"
                    onClick={() =>
                      rememberPendingDestination(qrPayload, "code")
                    }
                  >
                    Create a free account
                  </Link>{" "}
                  and save it as an editable code
                </>
              )}
              . You get 3 free. No credit card.
            </p>
          </div>
        ) : null}

        {mode === "link" && pendingLink && !signedIn ? (
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-sm font-medium">Save this as a short link</p>
            <p className="mt-2 break-all rounded-md border border-line bg-paper-deep/60 p-3 font-mono text-sm text-ink">
              {pendingLink}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              A scst.one short link can be edited later and does not expire.
              That needs a free account, because we have to store the redirect.
              You get 3 free codes or short links, and no credit card.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href="/signup" variant="accent">
                Create a free account
              </ButtonLink>
              <ButtonLink href={loginHref} variant="ghost">
                Log in
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Need a QR code right now, with no account?{" "}
              <button
                type="button"
                className="font-medium text-verdigris-deep underline underline-offset-4"
                onClick={() => {
                  setMode("qr");
                  history.replaceState(null, "", "#qr");
                  makeQr(pendingLink);
                }}
              >
                Make a static one from this link
              </button>
              .
            </p>
          </div>
        ) : null}
      </Card>
    </section>
  );
}
