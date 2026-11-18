"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

let firstLoad = true;

const COLS = 12;
const ROWS = 8;
const LABELS: Record<string, string> = {
  "/": "Scanstone",
  "/pricing": "Pricing",
  "/about": "About",
  "/blog": "Blog",
  "/demo": "Live demo",
  "/privacy": "Privacy",
  "/terms": "Terms",
  "/qr-code-generator": "Free generator",
  "/wifi-qr-code-generator": "WiFi codes",
  "/vcard-qr-code-generator": "Contact cards",
  "/restaurant-menu-qr-code": "Restaurants",
};

// Deterministic tile field: delay grows with distance from the centre, a few
// tiles glint verdigris like modules of a code breaking apart.
const TILES = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  const dx = (c + 0.5) / COLS - 0.5;
  const dy = (r + 0.5) / ROWS - 0.5;
  const d = Math.hypot(dx * 1.4, dy);
  const h = Math.abs(((c + 1) * 73856093) ^ ((r + 1) * 19349663)) % 13;
  return { d: Math.round(d * 620 + h * 14), glint: h === 0 || h === 5 };
});

/**
 * On client-side navigation the new page is revealed through a field of
 * night tiles that flip away from the centre outwards, with the destination's
 * name held for a beat. The very first load skips it, so the hero paints
 * immediately for LCP.
 */
export function RouteCurtain({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => typeof window !== "undefined" && !firstLoad);
  const path = usePathname();
  useEffect(() => {
    firstLoad = false;
  }, []);
  if (!animate) return <>{children}</>;
  const label = LABELS[path] ?? (path.startsWith("/blog/") ? "Reading" : "Scanstone");
  return (
    <>
      <div className="tile-curtain" aria-hidden="true">
        <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
          {TILES.map((t, i) => (
            <span key={i} className={`tile-out ${t.glint ? "tile-glint" : ""}`} style={{ "--d": `${t.d}ms` } as React.CSSProperties} />
          ))}
        </div>
        <span className="tile-label display absolute inset-0 flex items-center justify-center text-5xl italic text-paper sm:text-7xl">
          {label}
        </span>
      </div>
      <div className="page-in">{children}</div>
    </>
  );
}
