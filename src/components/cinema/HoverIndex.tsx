"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Row = { href: string; q: string; tag: string; preview: React.ReactNode };

/**
 * A big index of questions. On a fine pointer, a small printed card follows
 * the cursor and swaps to the hovered row's code; rows slide as you pass.
 * Touch and reduced motion get the plain list.
 */
export function HoverIndex({ rows }: { rows: Row[] }) {
  const [on, setOn] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    const f = follower.current;
    if (!el || !f) return;
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const tick = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      const rot = Math.max(-10, Math.min(10, (tx - x) * 0.08));
      f.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rot}deg)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const enter = (e: PointerEvent) => {
      move(e);
      x = tx;
      y = ty;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const leave = () => cancelAnimationFrame(raf);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={box} className="hix relative" onPointerLeave={() => setOn(-1)}>
      <ol className="border-t border-line">
        {rows.map((r, i) => (
          <li key={r.href + r.q} className="border-b border-line">
            <Link
              href={r.href}
              onPointerEnter={() => setOn(i)}
              onFocus={() => setOn(i)}
              onBlur={() => setOn(-1)}
              className={`hix-row group flex items-baseline gap-5 py-6 transition-[color,padding] duration-500 ease-[var(--ease-settle)] sm:gap-8 sm:py-8 ${on === i ? "text-verdigris-deep sm:pl-6" : on >= 0 ? "text-ink/35" : "text-ink"}`}
            >
              <span className="font-mono text-xs text-copper">{String(i + 1).padStart(2, "0")}</span>
              <span className="display flex-1 text-[clamp(1.8rem,4.2vw,3.6rem)] leading-[1.02] tracking-[-0.02em]">{r.q}</span>
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint sm:inline">{r.tag}</span>
              <span aria-hidden="true" className="text-2xl transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </li>
        ))}
      </ol>
      <div
        ref={follower}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-10 hidden w-40 transition-opacity duration-300 [@media(pointer:fine)]:block ${on >= 0 ? "opacity-100" : "opacity-0"}`}
      >
        <div className="relative aspect-[3/4] rounded-[10px] bg-[#efe7d6] p-4 shadow-[0_30px_70px_-20px_rgba(22,20,17,0.55)]">
          {rows.map((r, i) => (
            <div key={i} className={`absolute inset-4 flex flex-col transition-[opacity,transform] duration-300 ${on === i ? "opacity-100" : "translate-y-2 opacity-0"}`}>
              <p className="text-center font-mono text-[8px] uppercase tracking-[0.2em] text-ink-faint">{r.tag}</p>
              <div className="mt-auto">{r.preview}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
