"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GATED = "main > *, footer, [data-card], [data-anim-gate]";

/**
 * Pauses every CSS animation in a section while it's off screen. Looping
 * effects (chip steps, code sweeps, the Pro sheen) stop costing main-thread
 * time, and one-shot entrances wait to play until you actually arrive.
 */
export function AnimGate() {
  const path = usePathname();
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>(GATED)];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.toggleAttribute("data-off", !e.isIntersecting);
      },
      { rootMargin: "10% 0px" },
    );
    for (const el of els) io.observe(el);
    return () => {
      io.disconnect();
      for (const el of els) el.removeAttribute("data-off");
    };
  }, [path]);
  return null;
}
