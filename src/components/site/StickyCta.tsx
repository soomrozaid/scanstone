"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Mobile-only bottom bar that appears once the hero CTA has scrolled away. */
export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const nearEnd =
        window.innerHeight + y > document.documentElement.scrollHeight - 900;
      setShow(y > 700 && !nearEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-3 bottom-3 z-30 transition-all duration-300 ease-[var(--ease-settle)] md:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"}`}
    >
      <div className="flex items-center justify-between gap-3 rounded-full border border-night-line bg-night/95 py-2 pl-5 pr-2 text-paper shadow-[var(--shadow-lift)] backdrop-blur">
        <span className="text-sm text-paper/80">3 editable codes, free</span>
        <Link
          href="/signup"
          tabIndex={show ? 0 : -1}
          className="rounded-full bg-verdigris px-4 py-2.5 text-sm font-medium text-paper"
        >
          Start free
        </Link>
      </div>
    </div>
  );
}
