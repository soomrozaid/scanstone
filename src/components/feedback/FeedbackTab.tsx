"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { getOrCreateAnonId } from "@/lib/anon-id-client";
import { FEEDBACK_MESSAGE_MAX, type FeedbackReaction } from "@/lib/feedback";

const REACTIONS: Array<{ id: FeedbackReaction; face: string; label: string }> = [
  { id: "good", face: "🙂", label: "Good" },
  { id: "okay", face: "😐", label: "Okay" },
  { id: "bad", face: "🙁", label: "Not great" },
];

type Status = "idle" | "sending" | "sent" | "error";

/**
 * A small Feedback tab on the right edge of every page. It opens a panel with
 * three faces, an optional note and an optional reply email, and one Send
 * button. No account, no page change. It sits halfway up the screen so it never
 * covers the bottom pills (Continue on your phone, the phone CTA bar, the
 * sign-in prompt).
 */
export function FeedbackTab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reaction, setReaction] = useState<FeedbackReaction | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const tabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const panelId = useId();

  function close() {
    setOpen(false);
    tabRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        tabRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || tabRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  function openPanel() {
    // After a successful send, start fresh.
    if (status === "sent") {
      setReaction(null);
      setMessage("");
      setEmail("");
      setStatus("idle");
    }
    setError(null);
    setOpen(true);
  }

  async function send() {
    if (!reaction && !message.trim()) {
      setError("Pick a face or write a few words.");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reaction,
          message,
          email,
          website,
          page_path: window.location.pathname,
          anon_id: getOrCreateAnonId(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "That didn't send. Try again in a moment.");
        setStatus("error");
        return;
      }
      track("feedback_sent", { reaction: reaction ?? "none" });
      setStatus("sent");
    } catch {
      setError("That didn't send. Check your connection and try again.");
      setStatus("error");
    }
  }

  // Not on the bare redirect or error pages, where there is no site chrome.
  if (pathname?.startsWith("/r/")) return null;

  return (
    <div className="feedback-tab print:hidden">
      <button
        ref={tabRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : openPanel())}
        className="fixed right-0 top-1/2 z-[44] flex min-h-24 w-9 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-paper/20 bg-ink text-paper shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-colors hover:bg-verdigris-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verdigris"
      >
        <span className="rotate-180 text-xs font-medium tracking-wide [writing-mode:vertical-rl]">
          Feedback
        </span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="fixed right-11 top-1/2 z-[45] w-[min(21rem,calc(100vw-3.5rem))] -translate-y-1/2 rounded-2xl border border-line bg-paper p-4 text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p id={titleId} className="text-sm font-semibold">
              {status === "sent" ? "Thanks, got it" : "Quick feedback"}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close feedback"
              className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper-deep hover:text-ink"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {status === "sent" ? (
            <div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                A person reads every one.
                {email ? " If you asked something, we'll reply by email." : ""}
              </p>
              <button
                type="button"
                data-autofocus
                onClick={close}
                className="mt-4 inline-flex min-h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper hover:bg-verdigris-deep"
              >
                Close
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <fieldset className="mt-3">
                <legend className="text-sm text-ink-soft">
                  How is Scanstone working for you?
                </legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {REACTIONS.map((r, i) => (
                    <button
                      key={r.id}
                      type="button"
                      data-autofocus={i === 0 ? true : undefined}
                      aria-pressed={reaction === r.id}
                      onClick={() => {
                        setReaction(reaction === r.id ? null : r.id);
                        setError(null);
                      }}
                      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-xs font-medium transition-colors ${
                        reaction === r.id
                          ? "border-verdigris bg-verdigris/10 text-ink"
                          : "border-line bg-white/60 text-ink-soft hover:text-ink"
                      }`}
                    >
                      <span aria-hidden="true" className="text-xl leading-none">
                        {r.face}
                      </span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label htmlFor={`${panelId}-msg`} className="mt-3 block text-sm text-ink-soft">
                Anything to add? <span className="text-ink-faint">(optional)</span>
              </label>
              <textarea
                id={`${panelId}-msg`}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError(null);
                }}
                rows={2}
                maxLength={FEEDBACK_MESSAGE_MAX}
                className="mt-1 w-full resize-y rounded-md border border-line bg-white/70 px-3 py-2 text-base text-ink placeholder:text-ink-faint focus:border-verdigris sm:text-sm"
                placeholder="What worked, what didn't, what's missing"
              />

              <label htmlFor={`${panelId}-email`} className="mt-2 block text-sm text-ink-soft">
                Email for a reply <span className="text-ink-faint">(optional)</span>
              </label>
              <input
                id={`${panelId}-email`}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 min-h-10 w-full rounded-md border border-line bg-white/70 px-3 text-base text-ink focus:border-verdigris sm:text-sm"
              />

              {/* Honeypot for bots. Hidden from people and screen readers. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="absolute -left-[9999px] h-px w-px opacity-0"
              />

              {error ? (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-verdigris-deep px-5 text-sm font-medium text-paper transition-colors hover:bg-ink disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send"}
              </button>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
