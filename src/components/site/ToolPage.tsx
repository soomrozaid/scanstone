import type { ReactNode } from "react";
import Link from "next/link";
import { Container, Eyebrow, Fig } from "./primitives";
import { Faq } from "./Faq";
import { CtaBand } from "./CtaBand";
import { DarkHero } from "@/components/cinema/DarkHero";
import { SplitWords } from "@/components/cinema/SplitWords";
import { AssembleQR } from "@/components/cinema/AssembleQR";

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
      <DarkHero glow="80% 30%">
        <Container className="grid items-center gap-10 pb-40 pt-14 sm:pt-20 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <Eyebrow tone="verdigris" className="rise !text-verdigris-bright">
              {eyebrow}
            </Eyebrow>
            <h1 className="display mt-6 max-w-4xl text-[clamp(2.8rem,6.4vw,5.8rem)] leading-[0.95] tracking-[-0.03em]">
              <SplitWords text={title} start={60} />{" "}
              <span className="block">
                <SplitWords text={accent} start={260} wordClass="italic text-verdigris-bright" />
              </span>
            </h1>
            <p className="rise mt-6 max-w-2xl text-lead text-paper/70 [animation-delay:400ms]">{lead}</p>
            <nav aria-label="Free tools" className="rise mt-8 flex flex-wrap gap-2 [animation-delay:500ms]">
              {TOOLS.map((t) => {
                const on = t.href === current;
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    className={`rounded-full border px-4 py-2 text-sm transition ${on ? "border-paper bg-paper text-ink" : "border-white/15 bg-white/5 text-paper/70 hover:border-white/40 hover:text-paper"}`}
                  >
                    {t.label}
                    <span className={`ml-2 hidden text-xs sm:inline ${on ? "text-ink-faint" : "text-paper/45"}`}>
                      {t.sub}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="hidden lg:block">
            <AssembleQR
              data="https://www.scanstone.ca"
              label="Example QR code for scanstone.ca"
              className="mx-auto w-[300px] rotate-[-4deg] shadow-[0_40px_120px_-20px_rgba(79,174,155,0.45)]"
            />
          </div>
        </Container>
      </DarkHero>
      <section className="relative">
        <Container className="relative -mt-28 pb-20">{tool}</Container>
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
