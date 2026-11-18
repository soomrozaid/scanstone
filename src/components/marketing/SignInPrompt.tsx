"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  GENERATION_NOTED_EVENT,
  dismissSignInPrompt,
  getLocalGenerationCount,
  shouldShowSignInPrompt,
} from "@/lib/signin-prompt-state";

function returnPath(): string {
  if (typeof window === "undefined") return "/";
  const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return "/";
  }
  if (path.startsWith("/login") || path.startsWith("/signup")) return "/";
  return path.length > 512 ? window.location.pathname : path;
}

function authHref(kind: "signup" | "login"): string {
  const next = returnPath();
  return `/${kind}?next=${encodeURIComponent(next)}`;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(GENERATION_NOTED_EVENT, onStoreChange);
  return () => window.removeEventListener(GENERATION_NOTED_EVENT, onStoreChange);
}

function promptVisible(): boolean {
  return shouldShowSignInPrompt(getLocalGenerationCount());
}

function hiddenOnServer(): boolean {
  return false;
}

/**
 * A small, dismissible card after a few anonymous generations.
 * It never blocks the tool and never asks the visitor to upgrade.
 */
export function SignInPrompt({ signedIn }: { signedIn: boolean }) {
  const shouldShow = useSyncExternalStore(subscribe, promptVisible, hiddenOnServer);

  const onDismiss = useCallback(() => {
    dismissSignInPrompt();
  }, []);

  if (signedIn || !shouldShow) return null;

  return (
    <aside
      role="status"
      aria-label="Create a free account"
      className="pointer-events-none fixed inset-x-3 bottom-24 z-[35] md:inset-x-auto md:bottom-6 md:right-6 md:w-[24rem]"
    >
      <div className="pointer-events-auto rounded-2xl border border-line bg-paper p-4 text-ink shadow-[var(--shadow-lift)]">
        <p className="font-medium text-ink">Create a free account to save this history</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Scanstone is free. You can make as many static QR codes as you like,
          and we will never ask you to pay or upgrade for those.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          A free account saves the work from this browser. It includes 3
          dynamic codes or short links. You only pay if you want more than 3
          dynamic codes.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={authHref("signup")}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-medium text-paper hover:bg-verdigris-deep"
          >
            Create a free account
          </Link>
          <Link
            href={authHref("login")}
            className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium text-ink-soft hover:text-ink"
          >
            Log in
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm text-ink-soft hover:text-ink"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
