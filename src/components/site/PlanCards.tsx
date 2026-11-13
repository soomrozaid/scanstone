"use client";

import Link from "next/link";
import { RollingNumber } from "@/components/cinema/RollingNumber";
import { useState } from "react";
import { PRICING } from "@/lib/plans";

const FREE = [
  "Unlimited static QR codes: link, WiFi, contact, text",
  "3 short links or dynamic QR codes in total",
  "Editable destinations on scst.one",
  "Scan and click counts with 30 days of history",
  "Print-ready 2048px PNG downloads",
  "The covenant: redirects never expire",
];
const PRO = [
  "Everything in Free",
  "Up to 500 short links or dynamic QR codes in total",
  "Full scan and click history",
  "Vector SVG downloads for professional printing",
  "CSV export for reports",
];

function Check({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`mt-0.5 shrink-0 ${dark ? "text-verdigris-bright" : "text-verdigris"}`}
    >
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlanCards({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const [yearly, setYearly] = useState(false);
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div>
      <div className="flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="relative inline-grid grid-cols-2 rounded-full border border-line bg-paper p-1 text-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]"
        >
          <span
            aria-hidden="true"
            className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-300 ease-[var(--ease-settle)] ${yearly ? "translate-x-[calc(100%+4px)]" : "translate-x-1"}`}
            style={{ left: 0 }}
          />
          {[
            [false, "Monthly"],
            [true, "Yearly"],
          ].map(([v, label]) => (
            <button
              key={String(label)}
              type="button"
              role="radio"
              aria-checked={yearly === v}
              onClick={() => setYearly(v as boolean)}
              className={`relative z-10 cursor-pointer rounded-full px-5 py-2 transition-colors ${yearly === v ? "text-paper" : "text-ink-soft"}`}
            >
              {label as string}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col rounded-[28px] border border-line bg-paper p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] sm:p-10">
          <H className="display text-h3">Free</H>
          <p className="mt-2 text-sm text-ink-soft">
            For your first menu, sign or card. No card needed.
          </p>
          <p className="mt-8 flex items-baseline gap-2">
            <span className="display text-6xl">$0</span>
            <span className="text-sm text-ink-faint">forever</span>
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-soft">
            {FREE.map((f) => (
              <li key={f} className="flex gap-3">
                <Check />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="mt-auto inline-flex w-full items-center justify-center rounded-full border border-ink/80 px-5 py-3.5 font-medium text-ink transition hover:bg-ink hover:text-paper max-lg:mt-10 lg:mt-10"
          >
            Start free
          </Link>
        </div>

        <div className="pro-card relative flex flex-col overflow-hidden rounded-[28px] bg-night p-8 text-paper shadow-[var(--shadow-lift)] ring-1 ring-white/10 sm:p-10">
          <div className="pro-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="gridlines-night absolute inset-0" aria-hidden="true" />
          <div className="relative flex items-center justify-between">
            <H className="display text-h3">Pro</H>
            <span className="eyebrow rounded-full border border-night-line px-3 py-1 text-paper/60">
              For working print
            </span>
          </div>
          <p className="relative mt-2 text-sm text-paper/60">
            For a whole location, a busy agent, or a season of events.
          </p>
          <p className="relative mt-8 flex items-baseline gap-2">
            <span className="display flex text-6xl leading-none">
              $<RollingNumber minDigits={2} value={yearly ? PRICING.yearly.amount : PRICING.monthly.amount} />
            </span>
            <span className="text-sm text-paper/50">
              USD/{yearly ? "year" : "month"}
            </span>
          </p>
          <p className="relative mt-1 text-xs text-paper/50" aria-live="polite">
            {yearly
              ? `${PRICING.yearly.label}, ${PRICING.yearly.note}`
              : `or ${PRICING.yearly.label} (${PRICING.yearly.note})`}
          </p>
          <ul className="relative mt-8 space-y-3 text-sm text-paper/80">
            {PRO.map((f) => (
              <li key={f} className="flex gap-3">
                <Check dark />
                {f}
              </li>
            ))}
          </ul>
          <p className="relative mt-6 text-sm leading-relaxed text-paper/60">
            If you cancel, printed codes and short links keep working. You only
            lose the Pro extras. That promise is in{" "}
            <Link href="/terms#covenant" className="text-paper underline underline-offset-2">
              our terms
            </Link>
            .
          </p>
          <Link
            href="/signup"
            className="relative mt-10 inline-flex w-full items-center justify-center rounded-full bg-verdigris px-5 py-3.5 font-medium text-paper transition hover:bg-verdigris-bright hover:text-night"
          >
            Go Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
