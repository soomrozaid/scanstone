"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Desktop only: a small "continue on your phone" tab. Opening it carves a
 * plain static QR of the page you're on, so you can pick up reading on your
 * phone. Nothing is tracked; the code is just this page's address.
 */
export function PhoneHandoff() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<string | null>(null);
  const [cells, setCells] = useState<{ d: string; n: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.9);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  const [last, setLast] = useState(pathname);
  if (last !== pathname) {
    setLast(pathname);
    setOpen(false);
    setCells(null);
  }

  useEffect(() => {
    if (!open || cells) return;
    let alive = true;
    import("@/lib/qr/matrix").then(({ buildMatrix }) => {
      if (!alive) return;
      const url = window.location.origin + window.location.pathname;
      const m = buildMatrix(url, "M");
      let d = "";
      for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.get(r, c)) d += `M${c} ${r}h1v1h-1z`;
      setCells({ d, n: m.size });
      setPath(window.location.host + window.location.pathname);
    });
    return () => {
      alive = false;
    };
  }, [open, cells]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false);
    };
    addEventListener("keydown", onKey);
    addEventListener("mousedown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={panel}
      className={`ph fixed bottom-5 right-5 z-30 hidden transition-[opacity,transform] duration-500 lg:block ${show || open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      {open && (
        <div
          id="phone-handoff"
          role="dialog"
          aria-label="Open this page on your phone"
          className="ph-panel absolute bottom-14 right-0 w-[248px] rounded-[24px] border border-night-line bg-night p-4 text-paper shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
        >
          <div className="relative rounded-2xl bg-[#efe7d6] p-3">
            {cells ? (
              <svg viewBox={`0 0 ${cells.n} ${cells.n}`} className="ph-qr block aspect-square w-full" shapeRendering="crispEdges" role="img" aria-label={`QR code for ${path}`}>
                <path d={cells.d} className="fill-ink" />
              </svg>
            ) : (
              <div className="aspect-square w-full animate-pulse rounded-lg bg-ink/10" />
            )}
            <span className="ph-scan pointer-events-none absolute inset-x-3 top-3 h-0.5 rounded bg-verdigris-bright shadow-[0_0_12px_2px_rgba(79,174,155,0.7)]" aria-hidden="true" />
          </div>
          <p className="mt-3 break-all font-mono text-[10px] text-paper/60">{path}</p>
          <p className="mt-1 text-xs leading-relaxed text-paper/80">
            Point your phone camera here to keep reading there. A plain static code, nothing tracked.
          </p>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="phone-handoff"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full border border-night-line bg-night/90 py-2 pl-3 pr-4 text-sm text-paper shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur transition-colors hover:bg-night"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4 text-verdigris-bright" aria-hidden="true">
          <rect x="4" y="1" width="8" height="14" rx="2" className="fill-none stroke-current" strokeWidth="1.4" />
          <rect x="6.5" y="12" width="3" height="1" className="fill-current" />
        </svg>
        {open ? "Close" : "Continue on your phone"}
      </button>
    </div>
  );
}
