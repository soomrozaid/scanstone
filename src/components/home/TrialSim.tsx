"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

const STOPS = [
  { day: 1, label: "Day 1", note: "You print 200 table tents." },
  { day: 14, label: "Day 14", note: "The free trial quietly ends." },
  { day: 15, label: "Day 15", note: "A guest scans the code at dinner." },
  { day: 1095, label: "Year 3", note: "Same tents, still on the tables." },
];

function Phone({
  dead,
  brand,
}: {
  dead: boolean;
  brand: "trial" | "scanstone";
}) {
  return (
    <div className="mx-auto w-full max-w-[190px] rounded-[26px] bg-ink p-1.5 shadow-[var(--shadow-lift)]">
      <div className="relative aspect-[9/14] overflow-hidden rounded-[20px] bg-white">
        <div
          className={`absolute inset-0 flex flex-col p-4 transition-opacity duration-500 ${dead ? "opacity-0" : "opacity-100"}`}
        >
          <div className="h-14 rounded-lg bg-gradient-to-br from-verdigris to-verdigris-deep" />
          <p className="display mt-3 text-lg leading-tight">Tonight&apos;s menu</p>
          {["Soup of the day", "Bison burger", "Saskatoon berry pie"].map(
            (l) => (
              <p
                key={l}
                className="mt-2 border-b border-dashed border-black/10 pb-1.5 text-[0.65rem] text-ink-soft"
              >
                {l}
              </p>
            ),
          )}
        </div>
        <div
          aria-hidden={!dead}
          className={`absolute inset-0 flex flex-col items-center justify-center bg-[#f3f3f3] p-4 text-center transition-opacity duration-500 ${dead ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-lg text-danger">
            !
          </div>
          <p className="mt-3 text-[0.75rem] font-semibold text-[#333]">
            This QR code has been deactivated
          </p>
          <p className="mt-1.5 text-[0.62rem] leading-snug text-[#666]">
            Upgrade your plan to reactivate it.
          </p>
          <span className="mt-3 rounded bg-[#333] px-2.5 py-1 text-[0.6rem] text-white">
            See plans
          </span>
        </div>
      </div>
      <p className="sr-only">
        {brand === "trial"
          ? dead
            ? "Trial code: the guest sees a deactivated page."
            : "Trial code: the guest sees the menu."
          : "Scanstone code: the guest sees the menu."}
      </p>
    </div>
  );
}

export function TrialSim() {
  const [s, setS] = useState(0);
  const stop = STOPS[s] ?? STOPS[0]!;
  const trialDead = stop.day >= 15;

  return (
    <div className="rounded-[28px] border border-line bg-white/55 p-5 shadow-[var(--shadow-card)] sm:p-8">
      <div className="grid grid-cols-2 gap-4 sm:gap-10">
        <div>
          <p className="eyebrow min-h-[2.6em] text-center text-ink-faint">Typical trial generator</p>
          <div className="mt-4">
            <Phone dead={trialDead} brand="trial" />
          </div>
          <p
            className={`mt-4 text-center text-sm transition-colors ${trialDead ? "text-danger" : "text-ink-soft"}`}
          >
            {trialDead ? "Code switched off" : "Working"}
          </p>
        </div>
        <div>
          <p className="eyebrow min-h-[2.6em] text-center text-verdigris">Scanstone</p>
          <div className="mt-4">
            <Phone dead={false} brand="scanstone" />
          </div>
          <p className="mt-4 text-center text-sm text-verdigris-deep">
            Working{stop.day > 1 ? ", still" : ""}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <label htmlFor="trial-day" className="sr-only">
          Move through time
        </label>
        <input
          id="trial-day"
          type="range"
          min={0}
          max={STOPS.length - 1}
          step={1}
          value={s}
          onChange={(e) => {
            const v = Number(e.target.value);
            setS(v);
            if (v === 2) track("marketing_trial_sim", { stop: "day15" });
          }}
          aria-valuetext={`${stop.label}: ${stop.note}`}
          className="w-full cursor-pointer accent-verdigris"
        />
        <div className="mt-2 grid grid-cols-4 text-center">
          {STOPS.map((st, n) => (
            <button
              key={st.label}
              type="button"
              onClick={() => setS(n)}
              className={`eyebrow cursor-pointer py-1 transition-colors ${n === s ? "text-ink" : "text-ink-faint hover:text-ink-soft"}`}
            >
              {st.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-ink-soft" aria-live="polite">
          {stop.note}
        </p>
      </div>
    </div>
  );
}
