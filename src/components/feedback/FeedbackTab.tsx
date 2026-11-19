"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import {
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_TOPICS,
  type FeedbackReaction,
  type FeedbackTopic,
} from "@/lib/feedback";

const REACTIONS: Array<{ id: FeedbackReaction; face: string; label: string }> = [
  { id: "good", face: "🙂", label: "Good" },
  { id: "okay", face: "😐", label: "Okay" },
  { id: "bad", face: "🙁", label: "Not great" },
];

type Status = "idle" | "sending" | "sent" | "error";

/**
 * A small Feedback tab on the right edge of dashboard pages. The panel is a
 * face, a few tappable "what to change" chips, an optional note behind a link,
 * and one Send button. The user is signed in, so the server attaches who sent
 * it. It sits halfway up the screen so it never covers bottom bars.
 */
export function FeedbackTab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reaction, setReaction] = useState<FeedbackReaction | null>(null);
  const [topics, setTopics] = useState<FeedbackTopic[]>([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const tabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (noteOpen) noteRef.current?.focus();
  }, [noteOpen]);

  function openPanel() {
    // After a successful send, start fresh.
    if (status === "sent") {
      setReaction(null);
      setTopics([]);
      setMessage("");
      setNoteOpen(false);
      setStatus("idle");
    }
    setError(null);
    setOpen(true);
  }

  function toggleTopic(id: FeedbackTopic) {
    setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
    setError(null);
  }

  async function send() {
    if (!reaction && topics.length === 0 && !message.trim()) {
      setError("Pick a face or tap what to change.");
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
          topics,
          message,
          page_path: window.location.pathname,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "That didn't send. Try again in a moment.");
        setStatus("error");
        return;
      }
      track("feedback_sent", { reaction: reaction ?? "none", topics: topics.join(",") || "none" });
      setStatus("sent");
    } catch {
      setError("That didn't send. Check your connection and try again.");
      setStatus("error");
    }
  }

  // Dashboard pages only. Everyone there is signed in.
  if (!pathname?.startsWith("/dashboard")) return null;

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
                <legend className="sr-only">How is Scanstone working for you?</legend>
                <div className="grid grid-cols-3 gap-2">
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
                          ? "border-verdigris-deep bg-verdigris/15 text-ink ring-1 ring-verdigris-deep"
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

              <fieldset className="mt-4">
                <legend className="text-sm text-ink-soft">What should we change?</legend>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {FEEDBACK_TOPICS.map((t) => {
                    const on = topics.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleTopic(t.id)}
                        className={`inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors ${
                          on
                            ? "border-verdigris-deep bg-verdigris-deep text-paper"
                            : "border-line bg-white/60 text-ink-soft hover:border-ink-faint hover:text-ink"
                        }`}
                      >
                        {on ? <span aria-hidden="true">✓</span> : null}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {noteOpen ? (
                <input
                  ref={noteRef}
                  type="text"
                  aria-label="Note (optional)"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setError(null);
                  }}
                  maxLength={FEEDBACK_MESSAGE_MAX}
                  placeholder="Anything else? (optional)"
                  className="mt-3 min-h-10 w-full rounded-full border border-line bg-white/70 px-4 text-base text-ink placeholder:text-ink-faint focus:border-verdigris sm:text-sm"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setNoteOpen(true)}
                  className="mt-3 text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
                >
                  Add a note
                </button>
              )}

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
