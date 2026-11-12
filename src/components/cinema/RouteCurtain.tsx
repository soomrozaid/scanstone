"use client";

import { useEffect, useState } from "react";

let firstLoad = true;

/**
 * A night curtain lifts off the new page on client-side navigation. The very
 * first load skips it, so the hero paints immediately for LCP.
 */
export function RouteCurtain({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => typeof window !== "undefined" && !firstLoad);
  useEffect(() => {
    firstLoad = false;
  }, []);
  if (!animate) return <>{children}</>;
  return (
    <>
      <div className="curtain" aria-hidden="true">
        <div className="flex h-full items-center justify-center">
          <span className="display text-5xl italic text-paper/80">Scanstone</span>
        </div>
      </div>
      <div className="page-in">{children}</div>
    </>
  );
}
