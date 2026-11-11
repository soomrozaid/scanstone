"use client";

import { useState } from "react";
import { QRPreview } from "@/components/qr/QRPreview";
import { envClient } from "@/config/env.client";
import { track } from "@vercel/analytics";

const MENUS = ["Spring menu", "Summer menu"] as const;
const QR_OPTIONS = { fg: "#1c1917", bg: "#ffffff", shape: "square" as const };

/** An illustration of editing a destination after printing; no live codes mutate. */
export function HeroVisual() {
  const [menu, setMenu] = useState<(typeof MENUS)[number]>("Spring menu");

  return (
    <div
      data-testid="hero-visual"
      className="relative rounded-2xl border border-line bg-paper-deep/70 p-5 sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between gap-3 text-xs text-ink-soft">
        <span className="font-mono uppercase tracking-wider">
          Try a menu change
        </span>
        <span className="rounded-full border border-line bg-paper px-2.5 py-1">
          Interactive example
        </span>
      </div>
      <div className="mx-auto max-w-64 rounded-lg border border-line bg-paper p-6 text-center shadow-[var(--shadow-card)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-soft">
          Your café · table 01
        </p>
        <p className="engraved mt-3 text-3xl">
          Good things
          <br />
          on the menu.
        </p>
        <QRPreview
          data={`${envClient.APP_URL}/demo`}
          options={QR_OPTIONS}
          className="mx-auto mt-5 max-w-40"
        />
        <p className="mt-3 text-xs text-ink-soft">
          Scan for the live Scanstone demo
        </p>
      </div>
      <div
        className="mx-auto my-4 h-7 w-px bg-verdigris/40"
        aria-hidden="true"
      />
      <div className="rounded-lg border border-verdigris/30 bg-white/70 p-4">
        <p className="text-xs text-ink-soft">Change the example destination</p>
        <div
          className="mt-3 grid grid-cols-2 gap-2"
          role="group"
          aria-label="Example menu destination"
        >
          {MENUS.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={menu === name}
              onClick={() => {
                setMenu(name);
                track("marketing_demo_changed", { destination: name });
              }}
              className={`cursor-pointer rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${menu === name ? "border-verdigris bg-verdigris text-paper" : "border-line text-ink-soft hover:bg-paper-deep"}`}
            >
              {name}
            </button>
          ))}
        </div>
        <p
          className="mt-3 text-sm text-verdigris-deep"
          aria-live="polite"
          aria-atomic="true"
        >
          → {menu}. Same printed QR code.
        </p>
      </div>
      <p className="mt-4 text-center text-xs leading-relaxed text-ink-soft">
        Preview only. Your real destinations are managed in your dashboard.
      </p>
    </div>
  );
}
