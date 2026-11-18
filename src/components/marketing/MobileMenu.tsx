"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const LINKS = [
  { href: "/qr-code-generator", label: "Free QR generator" },
  { href: "/#short-link", label: "Short links" },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo", label: "Live demo" },
  { href: "/blog", label: "Blog" },
];

/**
 * Phone-only menu. Below md the desktop links are hidden, so without this
 * visitors had no way to reach Pricing, the blog or the demo from the header.
 */
export function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Close after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-md border border-line px-2.5 text-sm font-medium text-ink hover:bg-paper-deep"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" />
          )}
        </svg>
        <span className="max-[359px]:sr-only">Menu</span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-16 border-b border-line bg-paper shadow-sm"
      >
        <ul className="mx-auto max-w-6xl px-4 py-2 text-base">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-3 text-ink-soft hover:text-ink"
              >
                {l.label}
              </Link>
            </li>
          ))}
          {signedIn ? null : (
            <li className="border-t border-line">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block py-3 font-medium text-ink"
              >
                Log in
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
