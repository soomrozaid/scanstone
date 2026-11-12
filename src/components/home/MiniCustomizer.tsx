"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { renderQRSvg, type ModuleShape } from "@/lib/qr/svg";

const INKS = [
  { name: "Iron", fg: "#161411", paper: "#fbf8f1" },
  { name: "Verdigris", fg: "#1f5248", paper: "#eef4f1" },
  { name: "Copper", fg: "#8a4a1f", paper: "#fbf3ea" },
  { name: "Plum", fg: "#4e2d5c", paper: "#f6f0f7" },
  { name: "Navy", fg: "#1d2f4f", paper: "#eff2f7" },
];
const SHAPES: Array<{ id: ModuleShape; label: string }> = [
  { id: "square", label: "Cut" },
  { id: "rounded", label: "Worn" },
  { id: "dot", label: "Pebble" },
];

export function MiniCustomizer() {
  const [ink, setInk] = useState(0);
  const [shape, setShape] = useState<ModuleShape>("rounded");
  const [label, setLabel] = useState("Scan for the menu");
  const c = INKS[ink] ?? INKS[0]!;
  const svg = useMemo(
    () =>
      renderQRSvg("https://www.scanstone.ca", {
        fg: c.fg,
        bg: "#ffffff",
        shape,
      }),
    [c.fg, shape],
  );

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
      <div
        className="relative mx-auto flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-between rounded-[28px] border border-line p-8 shadow-[var(--shadow-lift)] transition-colors duration-500"
        style={{ background: c.paper }}
      >
        <p
          className="display text-center text-3xl leading-tight transition-colors duration-500"
          style={{ color: c.fg }}
        >
          {label || "\u00a0"}
        </p>
        <div
          className="w-[70%] rounded-2xl bg-white p-3 shadow-[var(--shadow-card)] [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="font-mono text-xs" style={{ color: c.fg }}>
          scst.one/yours
        </p>
      </div>

      <div>
        <fieldset>
          <legend className="eyebrow text-ink-faint">Ink</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {INKS.map((it, n) => (
              <button
                key={it.name}
                type="button"
                aria-pressed={n === ink}
                onClick={() => setInk(n)}
                className={`flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm transition ${n === ink ? "border-ink bg-white text-ink" : "border-line text-ink-soft hover:border-ink-faint"}`}
              >
                <span
                  className="h-6 w-6 rounded-full border border-black/10"
                  style={{ background: it.fg }}
                  aria-hidden="true"
                />
                {it.name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-7">
          <legend className="eyebrow text-ink-faint">Carving</legend>
          <div className="mt-3 inline-flex rounded-full border border-line bg-white/60 p-1">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={shape === s.id}
                onClick={() => setShape(s.id)}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-colors ${shape === s.id ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-7">
          <label htmlFor="mini-label" className="eyebrow block text-ink-faint">
            Call to action
          </label>
          <input
            id="mini-label"
            value={label}
            maxLength={28}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-3 w-full max-w-sm rounded-full border border-line bg-white/70 px-5 py-3 text-ink focus:border-verdigris"
          />
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/qr-code-generator"
            className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition hover:bg-verdigris-deep"
          >
            Make a real one, free
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-line px-6 py-3 font-medium text-ink transition hover:border-ink-faint"
          >
            Make it editable
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-faint">
          The code above opens scanstone.ca. Every style here still scans.
        </p>
      </div>
    </div>
  );
}
