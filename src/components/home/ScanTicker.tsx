"use client";

import { useEffect, useState } from "react";

const SAMPLE = [
  ["Canada", "mobile", "Table tent"],
  ["Canada", "mobile", "Window poster"],
  ["United States", "tablet", "Menu"],
  ["Canada", "desktop", "Business card"],
  ["Canada", "mobile", "Packaging"],
  ["United Kingdom", "mobile", "Event poster"],
] as const;

/** Sample feed showing exactly what a scan records: country, device, which print. */
export function ScanTicker() {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setN((v) => v + 1), 2200);
    return () => clearInterval(id);
  }, []);
  const rows = [0, 1, 2].map((k) => {
    const i = n - k;
    return { i, r: SAMPLE[((i % SAMPLE.length) + SAMPLE.length) % SAMPLE.length]! };
  });
  return (
    <div className="mt-8 space-y-2" aria-label="Sample scan feed">
      {rows.map(({ i, r }, k) => (
        <div
          key={i}
          className={`flex items-center justify-between rounded-xl border border-night-line bg-night-raised px-3.5 py-2.5 font-mono text-[11px] ${k === 0 ? "tick-in" : ""}`}
          style={{ opacity: 1 - k * 0.28 }}
        >
          <span className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${k === 0 ? "animate-pulse bg-verdigris-bright" : "bg-paper/30"}`} />
            {r[0]} · {r[1]}
          </span>
          <span className="text-paper/45">{r[2]}</span>
        </div>
      ))}
      <p className="pt-1 font-mono text-[10px] text-paper/35">Sample feed. No IPs, no cookies.</p>
    </div>
  );
}
