import Link from "next/link";
import { LazyVideo } from "@/components/cinema/LazyVideo";
import { Wordmark } from "./Wordmark";

const columns = [
  {
    title: "Free tools",
    links: [
      { href: "/#short-links", label: "URL shortener" },
      { href: "/qr-code-generator", label: "QR code generator" },
      { href: "/wifi-qr-code-generator", label: "WiFi QR code" },
      { href: "/vcard-qr-code-generator", label: "vCard QR code" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/restaurant-menu-qr-code", label: "Restaurant menus" },
      { href: "/demo", label: "Live demo" },
      { href: "/pricing", label: "Pricing" },
      { href: "/blog", label: "Blog" },
      { href: "/signup", label: "Create account" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "mailto:hello@scanstone.ca", label: "hello@scanstone.ca" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer data-nav="dark" className="relative overflow-hidden bg-night text-paper">
      <div className="gridlines-night absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 pt-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Wordmark tone="paper" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/60">
              QR codes for print. Short scst.one links for sharing. Free static
              codes forever, and redirects that keep working even if you stop
              paying.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-night-line px-3 py-1.5 text-xs text-paper/70">
              <span
                className="h-1.5 w-1.5 rounded-full bg-verdigris-bright"
                aria-hidden="true"
              />
              Redirects never expire. It&apos;s in{" "}
              <Link href="/terms" className="underline underline-offset-2">
                our terms
              </Link>
              .
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow text-paper/40">{col.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="link-underline text-paper/75 hover:text-paper"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="wm relative mt-20 select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <LazyVideo className="absolute inset-0 h-full w-full" />
          <p className="display pointer-events-none relative whitespace-nowrap bg-night pb-[0.06em] text-center text-[22vw] font-semibold leading-[0.85] tracking-[-0.04em] text-white mix-blend-multiply lg:text-[17rem]">
            {"Scanstone".split("").map((ch, i) => (
              <span key={i} className="wm-l inline-block" style={{ ["--i" as string]: i }}>
                {ch}
              </span>
            ))}
          </p>
        </div>
        <div className="flex flex-col items-center justify-between gap-2 border-t border-night-line py-6 text-xs text-paper/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Scanstone. Made in Saskatchewan.</span>
          <span>Printed codes deserve permanence.</span>
        </div>
      </div>
    </footer>
  );
}
