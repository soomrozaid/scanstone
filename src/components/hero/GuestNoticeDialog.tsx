"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { GUEST_NOTICE_TEXT } from "@/lib/guest-constants";

export function GuestNoticeDialog({
  open,
  signupHref,
  pending,
  onClose,
  onContinue,
}: {
  open: boolean;
  signupHref: string;
  pending?: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [checked, setChecked] = useState(false);

  if (!open && checked) setChecked(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    const onBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onBackdrop);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onBackdrop);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="guest-notice-title"
      aria-describedby="guest-notice-body"
      className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-paper p-6 text-left shadow-[var(--shadow-card)] backdrop:bg-ink/50"
    >
      <h2 id="guest-notice-title" className="engraved text-xl font-semibold">
        Keep this link safe
      </h2>
      <p id="guest-notice-body" className="mt-3 text-sm leading-relaxed text-ink-soft">
        Your link will work now. Without an account it&apos;s hard for us to keep
        our promise that it never expires. A free account keeps it safe and lets
        you edit where it points.
      </p>
      <Link
        href={signupHref}
        className="mt-5 inline-flex w-full items-center justify-center rounded-md border border-verdigris-deep bg-verdigris px-4 py-2.5 text-sm font-medium text-paper hover:bg-verdigris-deep"
      >
        Create a free account
      </Link>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink">
        <input
          id="guest-notice-accept"
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-verdigris"
        />
        <span>{GUEST_NOTICE_TEXT}</span>
      </label>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={!checked || pending}
          onClick={onContinue}
        >
          {pending ? "Creating…" : "Continue without an account"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </dialog>
  );
}
