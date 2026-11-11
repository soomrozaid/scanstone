import Link from "next/link";
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
      { href: "/signup", label: "Create account" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-deep/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:px-6">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            QR codes for print. Short scst.one links for sharing. Free static
            codes forever, and redirects that keep working even if you stop
            paying.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {col.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink-soft hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line/60 py-5 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} Scanstone · Printed codes deserve
        permanence.
      </div>
    </footer>
  );
}
