import type { ReactNode } from "react";
import Link from "next/link";
import { Container, Eyebrow, Fig } from "./primitives";
import { Faq } from "./Faq";
import { CtaBand } from "./CtaBand";

const TOOLS = [
  { href: "/qr-code-generator", label: "Link & text", sub: "Any URL or note" },
  { href: "/wifi-qr-code-generator", label: "WiFi", sub: "Join without typing" },
  { href: "/vcard-qr-code-generator", label: "Contact card", sub: "One scan, saved" },
];

export function ToolPage({
  eyebrow,
  title,
  accent,
  lead,
  tool,
  faqs,
  current,
  related,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  lead: ReactNode;
  tool: ReactNode;
  faqs: Array<{ q: string; a: string }>;
  current: string;
  related?: ReactNode;
}) {
  return (
    <main id="main">
      <section className="relative overflow-hidden">
        <div
          className="gridlines absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_65%)]"
          aria-hidden="true"
        />
        <Container className="relative pb-10 pt-12 sm:pt-20">
          <Eyebrow tone="verdigris" className="rise">
            {eyebrow}
          </Eyebrow>
          <h1 className="display rise mt-6 max-w-4xl text-h1">
            {title} <span className="block italic text-verdigris-deep">{accent}</span>
          </h1>
          <p className="rise mt-6 max-w-2xl text-lead text-ink-soft">{lead}</p>
          <nav aria-label="Free tools" className="rise mt-8 flex flex-wrap gap-2">
            {TOOLS.map((t) => {
              const on = t.href === current;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={on ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-sm transition ${on ? "border-ink bg-ink text-paper" : "border-line bg-white/50 text-ink-soft hover:border-ink-faint hover:text-ink"}`}
                >
                  {t.label}
                  <span className={`ml-2 hidden text-xs sm:inline ${on ? "text-paper/60" : "text-ink-faint"}`}>
                    {t.sub}
                  </span>
                </Link>
              );
            })}
          </nav>
        </Container>
        <Container className="relative pb-20">{tool}</Container>
      </section>

      <section aria-labelledby="tool-faq" className="border-t border-line bg-paper-deep/40 py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Fig n="01">FAQ</Fig>
            <h2 id="tool-faq" className="display mt-6 text-h2">
              Straight answers
            </h2>
            {related ? (
              <div className="mt-6 text-sm leading-relaxed text-ink-soft">{related}</div>
            ) : null}
          </div>
          <Faq items={faqs} />
        </Container>
      </section>

      <section className="py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Static or dynamic?</Eyebrow>
            <h2 className="display mt-5 text-h2">Printing it? Make it editable.</h2>
            <p className="mt-5 max-w-xl text-lead text-ink-soft">
              A static code is carved in for good. A dynamic code prints a short
              scst.one link, so you can change where it goes after printing and
              see how often it gets scanned. Three are free, and they keep
              working even if you never pay us.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Static", "Free, unlimited", "Content inside the pattern", "Can't edit after printing", "No scan counts"],
              ["Dynamic", "3 free, 500 on Pro", "Short link inside the pattern", "Edit any time", "Scan counts by day"],
            ].map(([h, ...rows], k) => (
              <div
                key={h}
                className={`rounded-[22px] p-6 ${k ? "bg-night text-paper" : "border border-line bg-white/60"}`}
              >
                <p className="display text-2xl">{h}</p>
                <ul className={`mt-4 space-y-2.5 ${k ? "text-paper/75" : "text-ink-soft"}`}>
                  {rows.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand
        title="Need to change it after printing?"
        body="Make a dynamic code instead. Three are free, no card needed, and the redirects never expire."
        primary={{ href: "/signup", label: "Make a dynamic code" }}
        secondary={{ href: "/demo", label: "See the live demo" }}
      />
    </main>
  );
}
