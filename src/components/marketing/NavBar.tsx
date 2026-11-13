"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/#qr", label: "Create QR" },
  { href: "/#short-link", label: "Short links" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "Help" },
];

export function NavBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    // The bar turns light-on-dark whenever it sits over a [data-nav="dark"] section.
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const hit = document
        .elementsFromPoint(window.innerWidth / 2, 32)
        .some((el) => el.closest("[data-nav='dark']"));
      setOverDark(hit);
    };
    onScroll();
    const t = setTimeout(onScroll, 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const dark = overDark || open;

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
        className={`sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${dark ? (scrolled ? "border-b border-white/10 bg-night/60 backdrop-blur-xl" : "border-b border-transparent bg-night/0") : scrolled || open ? "border-b border-line/80 bg-paper/80 backdrop-blur-xl" : "border-b border-transparent bg-paper/0"}`}
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
                    className={`inline-flex min-h-11 items-center rounded-full px-3.5 py-2 transition-colors ${dark ? "text-paper/75 hover:bg-paper/10 hover:text-paper" : active ? "bg-ink/[0.06] text-ink" : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink"}`}
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
                  className={`inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm transition ${dark ? "text-paper/75 hover:text-paper" : "text-ink-soft hover:text-ink"}`}
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
        className="menu-iris fixed inset-0 z-30 overflow-y-auto bg-night px-5 pb-10 pt-20 text-paper lg:hidden"
      >
        <div className="aurora pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="gridlines-night pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <ul className="relative divide-y divide-white/10 border-y border-white/10">
          {LINKS.map((l, i) => {
            const active = !l.href.includes("#") && pathname === l.href;
            return (
              <li key={l.href} className="menu-item overflow-hidden" style={{ ["--i" as string]: i }}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className="menu-link flex items-baseline gap-4 py-4"
                >
                  <span aria-hidden="true" className="font-mono text-[11px] text-copper-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`display text-[2.6rem] leading-none ${active ? "italic text-verdigris-bright" : "text-paper"}`}>
                    {l.label}
                  </span>
                  <span aria-hidden="true" className="ml-auto text-xl text-paper/50">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="menu-foot relative mt-8 grid gap-3">
          {signedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-paper py-3.5 text-center font-medium text-ink"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-full bg-verdigris-bright py-3.5 text-center font-medium text-night"
              >
                Start free, 3 codes
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-paper/30 py-3.5 text-center font-medium text-paper"
              >
                Log in
              </Link>
            </>
          )}
        </div>
        <p className="menu-foot relative mt-8 text-sm text-paper/60">
          Redirects that keep working, even if you stop paying.
        </p>
      </div>
    </>
  );
}
