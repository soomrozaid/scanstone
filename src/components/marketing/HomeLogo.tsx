"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./Wordmark";

type Lenis = { scrollTo: (n: number, o?: object) => void };

/**
 * Site mark that always goes to the homepage. On the homepage itself, a click
 * glides back to the top (through Lenis when it's running) instead of doing
 * nothing because the link is already the current path.
 */
export function HomeLogo({
  tone = "ink",
  size,
  className,
  onClick,
}: {
  tone?: "ink" | "paper";
  size?: number;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      aria-label="Scanstone home"
      className={className}
      onClick={(event) => {
        onClick?.();
        if (pathname !== "/") return;
        event.preventDefault();
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
        if (lenis) {
          lenis.scrollTo(0, { immediate: reduce, duration: reduce ? 0 : 1.1 });
          return;
        }
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
    >
      <Wordmark tone={tone} size={size} />
    </Link>
  );
}
