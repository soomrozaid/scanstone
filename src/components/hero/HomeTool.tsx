"use client";

import {
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useActionState } from "react";
import { track } from "@vercel/analytics";
import { createShortUrl } from "@/app/(app)/dashboard/actions";
import { createGuestShortUrl } from "@/app/(marketing)/guest-actions";
import { QRPreview } from "@/components/qr/QRPreview";
import { DesignControls } from "@/components/qr/DesignControls";
import { downloadPng, downloadSvg } from "@/components/qr/download";
import { CopyUrlButton } from "@/components/dashboard/CopyUrlButton";
import { GuestNoticeDialog } from "@/components/hero/GuestNoticeDialog";
import { Button, ButtonLink, FieldError, Input } from "@/components/ui";
import { isScannableCombo } from "@/lib/qr/contrast";
import { validateDestinationUrl, type QRDesign } from "@/lib/validate";
import { rememberPendingDestination } from "@/lib/pending-destination";
import { GUEST_NOTICE_VERSION } from "@/lib/guest-constants";

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

function hashForMode(mode: Mode) {
  return mode === "link" ? "#short-link" : "#qr";
}

function getHashMode(): Mode {
  const hash = window.location.hash;
  if (hash === "#short-link" || hash === "#short-links") return "link";
  return "qr";
}

function subscribeHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

export function HomeTool({ signedIn }: { signedIn: boolean }) {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientReady,
    serverReady,
  );
  const labelId = useId();
  const errorId = useId();
  const [url, setUrl] = useState("");
  const [design, setDesign] = useState<QRDesign>(DEFAULT_DESIGN);
  const [qrPayload, setQrPayload] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const guestFormRef = useRef<HTMLFormElement>(null);
  const [linkState, linkAction, linkPending] = useActionState(
    createShortUrl,
    null,
  );
  const [guestState, guestAction, guestPending] = useActionState(
    createGuestShortUrl,
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Record<Mode, HTMLButtonElement | null>>({
    qr: null,
    link: null,
  });

  const modeFromHash = useSyncExternalStore(
    subscribeHash,
    getHashMode,
    () => "qr" as Mode,
  );
  const [mode, setMode] = useState<Mode | null>(null);
  const currentMode = mode ?? modeFromHash;

  const scannable = isScannableCombo(design.fg, design.bg);
  const qrReady =
    qrPayload.length > 0 && qrPayload.length <= MAX_LEN && scannable;

  const signupHref = `/signup?next=${encodeURIComponent("/dashboard")}`;
  const loginHref = `/login?next=${encodeURIComponent("/dashboard")}`;

  function selectMode(next: Mode, updateHash = true) {
    setMode(next);
    setError(null);
    setDownloadError(null);
    setNoticeOpen(false);
    if (updateHash) {
      history.replaceState(null, "", hashForMode(next));
    }
  }

  function makeQr(raw: string = url, announce = false) {
    setDownloadError(null);
    const payload = normalizeStaticUrl(raw);
    if (!payload) {
      setQrPayload("");
      if (announce) setError("Enter a link first.");
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
    if (announce) track("home_tool_used", { mode: "qr" });
    return true;
  }

  function openGuestNotice() {
    const dest = validateDestinationUrl(url);
    if (!dest.ok) {
      setError(dest.error);
      inputRef.current?.focus();
      return false;
    }
    setError(null);
    setQrPayload("");
    setNoticeOpen(true);
    return true;
  }

  function onUrlChange(value: string) {
    setUrl(value);
    if (error) setError(null);
    if (currentMode === "qr") {
      // Live preview as the visitor types; errors wait for blur or submit.
      const payload = normalizeStaticUrl(value);
      if (payload && payload.length <= MAX_LEN) {
        setQrPayload(payload);
      } else {
        setQrPayload("");
      }
    }
  }

  function onUrlBlur() {
    if (currentMode !== "qr" || !url.trim()) return;
    makeQr(url, false);
  }

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const order: Mode[] = ["qr", "link"];
    const i = order.indexOf(currentMode);
    let next = currentMode;
    if (event.key === "ArrowRight") next = order[(i + 1) % order.length]!;
    if (event.key === "ArrowLeft") next = order[(i - 1 + order.length) % order.length]!;
    if (event.key === "Home") next = "qr";
    if (event.key === "End") next = "link";
    // Hash updates are a side effect, so selection is by activation, not
    // by focus alone. Arrow keys still select here because the panel is instant.
    selectMode(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <>
    <div data-testid="home-tool" className="mt-6 rounded-[22px] border border-white/10 bg-[#f4ecdc] p-4 text-ink shadow-[0_30px_80px_-28px_rgba(0,0,0,0.55)] sm:mt-7 sm:p-6">
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
            onKeyDown={onTabKey}
            className="grid grid-cols-2 gap-1 rounded-full border border-line bg-paper p-1"
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
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                aria-selected={currentMode === tab.id}
                tabIndex={currentMode === tab.id ? 0 : -1}
                onClick={() => selectMode(tab.id)}
                className="home-tool-tab relative min-h-11 rounded-full px-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink aria-selected:text-ink"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Codes don&apos;t expire.{" "}
            <Link href="/help" className="font-medium text-verdigris-deep underline underline-offset-4">
              Do codes expire?
            </Link>
            {" · "}
            <Link href="/pricing" className="font-medium text-verdigris-deep underline underline-offset-4">
              See pricing
            </Link>
          </p>

          <div
            id="home-tool-panel"
            role="tabpanel"
            aria-labelledby={`home-tool-tab-${currentMode}`}
            className="mt-4"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="home-tool-url"
                id={labelId}
                className="text-sm font-medium text-ink"
              >
                Your link
              </label>
              {currentMode === "qr" ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    makeQr(url, true);
                  }}
                  className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
                >
                  <Input
                    ref={inputRef}
                    id="home-tool-url"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="done"
                    placeholder="example.com/menu"
                    value={url}
                    onChange={(event) => onUrlChange(event.target.value)}
                    onBlur={onUrlBlur}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="min-h-11 py-2.5"
                  />
                  <Button
                    type="submit"
                    variant="accent"
                    className="min-h-11 shrink-0 px-5 sm:min-w-40"
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
                    <Input
                      ref={inputRef}
                      id="home-tool-url"
                      name="destination_url"
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="go"
                      placeholder="example.com/your-long-link"
                      value={url}
                      onChange={(event) => onUrlChange(event.target.value)}
                      required
                      maxLength={2048}
                      aria-invalid={error || linkState?.error ? true : undefined}
                      aria-describedby={error || linkState?.error ? errorId : undefined}
                      className="min-h-11 py-2.5"
                    />
                    <Button
                      type="submit"
                      variant="accent"
                      className="min-h-11 shrink-0 px-5 sm:min-w-40"
                      disabled={linkPending}
                    >
                      {linkPending ? "Saving…" : "Create short link"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    openGuestNotice();
                  }}
                  className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
                >
                  <Input
                    ref={inputRef}
                    id="home-tool-url"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    placeholder="example.com/your-long-link"
                    value={url}
                    onChange={(event) => onUrlChange(event.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="min-h-11 py-2.5"
                  />
                  <Button
                    type="submit"
                    variant="accent"
                    className="min-h-11 shrink-0 px-5 sm:min-w-40"
                    disabled={guestPending}
                  >
                    {guestPending ? "Creating…" : "Create short link"}
                  </Button>
                </form>
              )}
              <div id={errorId}>
                <FieldError>
                  {error ||
                    (currentMode === "link"
                      ? linkState?.error || guestState?.error
                      : null)}
                </FieldError>
              </div>
            </div>
          </div>
        </fieldset>

        {currentMode === "qr" && qrReady ? (
          <div className="mt-5 border-t border-line pt-5">
            <p className="mb-3 text-sm font-medium text-ink">Your QR code</p>
            <QRPreview
              data={qrPayload}
              options={design}
              className="mx-auto max-w-44 sm:max-w-52"
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                className="min-h-11"
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
                className="min-h-11"
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
            <p className="mt-3 text-center text-xs text-ink-soft">
              Free download. No account, no card, no trial.
            </p>
            <p className="mt-1 break-all text-center text-xs text-ink-faint">
              This is a static code. It opens{" "}
              <span className="font-mono text-ink-soft">{qrPayload}</span>{" "}
              directly, with nothing in between, so it can never be switched off.
            </p>
            {downloadError ? (
              <p role="alert" className="mt-2 text-center text-xs text-danger">
                {downloadError}
              </p>
            ) : null}
            <details className="mt-4">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm text-ink-soft hover:text-ink">
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
                <Link
                  href="/signup"
                  className="font-medium text-verdigris-deep underline underline-offset-4"
                  onClick={() => rememberPendingDestination(qrPayload, "code")}
                >
                  Create a free account and save it as an editable code
                </Link>
              )}
              . You get 3 free, and no credit card.
            </p>
          </div>
        ) : null}

        {currentMode === "link" && !signedIn && guestState?.shortUrl ? (
          <div className="mt-5 border-t border-line pt-5">
            <p className="text-sm font-medium text-ink">Here is your short link</p>
            <p
              data-testid="guest-short-url"
              className="mt-2 break-all rounded-md border border-line bg-paper-deep/60 p-3 font-mono text-sm text-ink"
            >
              {guestState.shortUrl}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyUrlButton url={guestState.shortUrl} />
            </div>
            <div className="mx-auto mt-5 max-w-48">
              <QRPreview data={guestState.shortUrl} options={design} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Your link works now. Without an account it&apos;s hard for us to
              keep our promise that it never expires, so make a free account to
              keep it safe and edit where it points.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href={signupHref} variant="accent" className="min-h-11">
                Create a free account
              </ButtonLink>
              <ButtonLink href={loginHref} variant="ghost" className="min-h-11">
                Log in
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </div>

      {!signedIn ? (
        <>
          <form ref={guestFormRef} action={guestAction} className="hidden">
            <input type="hidden" name="destination_url" value={url} />
            <input type="hidden" name="guest_notice_accepted" value="1" />
            <input
              type="hidden"
              name="guest_notice_version"
              value={GUEST_NOTICE_VERSION}
            />
          </form>
          <GuestNoticeDialog
            open={noticeOpen}
            signupHref={signupHref}
            pending={guestPending}
            onClose={() => setNoticeOpen(false)}
            onContinue={() => {
              track("home_tool_used", { mode: "link" });
              setNoticeOpen(false);
              guestFormRef.current?.requestSubmit();
            }}
          />
        </>
      ) : null}

      <p className="mt-4 text-sm text-paper/80">
        No account, no card, and no trial for a static QR code.
      </p>
    </>
  );
}
