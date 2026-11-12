"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#short-links", label: "Short links" },
  { href: "/qr-code-generator", label: "Free generator" },
  { href: "/demo", label: "Live demo" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
];

export function NavBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dark = pathname === "/" && !scrolled && !open;

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${scrolled || open ? "border-b border-line/80 bg-paper/80 backdrop-blur-xl" : "border-b border-transparent bg-paper/0"}`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
        >
          <Link href="/" aria-label="Scanstone home" className="relative z-50">
            <Wordmark tone={dark ? "paper" : "ink"} />
          </Link>
          <ul className="hidden items-center gap-1 text-sm lg:flex">
            {LINKS.map((l) => {
              const active = !l.href.includes("#") && pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex rounded-full px-3.5 py-2 transition-colors ${dark ? "text-paper/75 hover:bg-paper/10 hover:text-paper" : active ? "bg-ink/[0.06] text-ink" : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="hidden rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-soft sm:inline-flex"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`hidden rounded-full px-4 py-2 text-sm transition sm:inline-flex ${dark ? "text-paper/75 hover:text-paper" : "text-ink-soft hover:text-ink"}`}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  data-magnetic
                  className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${dark ? "bg-paper text-ink hover:bg-verdigris-bright" : "bg-ink text-paper hover:bg-verdigris-deep"}`}
                >
                  Start free
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </>
            )}
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className={`relative z-50 -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${dark ? "text-paper" : "text-ink"}`}
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 block h-[1.5px] w-5 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 block h-[1.5px] w-5 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-paper px-5 pb-10 pt-4 lg:hidden"
      >
        <ul className="divide-y divide-line border-y border-line">
          {LINKS.map((l, i) => (
            <li
              key={l.href}
              className="rise"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="display flex items-center justify-between py-4 text-3xl text-ink"
              >
                {l.label}
                <span aria-hidden="true" className="text-xl text-ink-faint">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-3">
          {signedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-ink py-3.5 text-center font-medium text-paper"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-full bg-verdigris py-3.5 text-center font-medium text-paper"
              >
                Start free, 3 codes
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-line py-3.5 text-center font-medium text-ink"
              >
                Log in
              </Link>
            </>
          )}
        </div>
        <p className="mt-8 text-sm text-ink-faint">
          Redirects that keep working, even if you stop paying.
        </p>
      </div>
    </>
  );
}
