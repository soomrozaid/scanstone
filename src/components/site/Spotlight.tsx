"use client";

import type { ReactNode } from "react";

/**
 * Card with hover depth: tilts toward the pointer in 3D, a glare follows the
 * cursor, and children marked [data-depth] float above the surface.
 * Fine pointers only; reduced motion keeps it flat.
 */
export function Spotlight({
  children,
  className = "",
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  return (
    <div className="h-full [perspective:1100px]">
      <div
        className={`spotlight tilt h-full ${className}`}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const el = e.currentTarget;
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          el.style.setProperty("--mx", `${e.clientX - r.left}px`);
          el.style.setProperty("--my", `${e.clientY - r.top}px`);
          el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
          el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.setProperty("--rx", "0deg");
          e.currentTarget.style.setProperty("--ry", "0deg");
        }}
      >
        {children}
      </div>
    </div>
  );
}
