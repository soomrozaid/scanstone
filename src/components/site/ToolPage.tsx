import type { ReactNode } from "react";
import Link from "next/link";
import { Container, Eyebrow } from "./primitives";
import { Breadcrumbs } from "./Breadcrumbs";
import { Faq } from "./Faq";
import { CtaBand } from "./CtaBand";
import { DarkHero } from "@/components/cinema/DarkHero";
import { SplitWords } from "@/components/cinema/SplitWords";
import { AssembleQR } from "@/components/cinema/AssembleQR";
import { ScanReadout } from "@/components/cinema/ScanReadout";

/** What the hero code really encodes on each tool page (example data). */
const HERO_PAYLOAD: Record<string, { data: string; kind: string; label: string }> = {
  "/qr-code-generator": { data: "https://www.scanstone.ca", kind: "URL", label: "Example QR code for scanstone.ca" },
  "/wifi-qr-code-generator": { data: "WIFI:T:WPA;S:Corner Cafe Guest;P:example-pass;;", kind: "WiFi", label: "Example WiFi QR code for a sample network" },
  "/vcard-qr-code-generator": { data: "BEGIN:VCARD\nVERSION:3.0\nFN:Alex Rivera\nTEL:+1-306-555-0123\nEND:VCARD", kind: "vCard", label: "Example contact card QR code for a sample person" },
};

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
            <Breadcrumbs
              tone="night"
              items={[{ href: "/qr-code-generator", label: "Free tools" }, { label: title }]}
            />
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
                    <span className={`ml-2 hidden text-xs sm:inline ${on ? "text-ink-faint" : "text-paper/60"}`}>
                      {t.sub}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="hidden lg:block">
            {(() => {
              const h = HERO_PAYLOAD[current] ?? HERO_PAYLOAD["/qr-code-generator"]!;
              return (
                <ScanReadout payload={h.data} kind={h.kind}>
                  <AssembleQR
                    data={h.data}
                    label={h.label}
                    className="mx-auto w-[300px] shadow-[0_40px_120px_-20px_rgba(79,174,155,0.45)]"
                  />
                </ScanReadout>
              );
            })()}
          </div>
        </Container>
      </DarkHero>
      <section className="relative">
        <Container className="relative -mt-28 pb-20">{tool}</Container>
      </section>

      <section aria-labelledby="tool-faq" data-nav="dark" className="night-portal relative overflow-hidden bg-night py-24 text-paper sm:py-32">
        <div className="aurora pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <Container className="relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-bright">Fig. 01 / FAQ</p>
            <h2 id="tool-faq" className="display mt-6 text-h2">
              Straight answers
            </h2>
            {related ? (
              <div className="mt-6 text-sm leading-relaxed text-paper/70 [&_a]:!text-verdigris-bright">{related}</div>
            ) : null}
          </div>
          <Faq items={faqs} tone="night" />
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
                <div aria-hidden="true" className="relative mb-5 w-24">
                  <AssembleQR lite data={k ? "https://scst.one/yours" : "https://www.scanstone.ca"} label="" className={`!rounded-[10px] !p-[9%] ${k ? "shadow-[0_0_40px_rgba(79,174,155,0.35)]" : ""}`} />
                  {k ? (
                    <span className="sd-chip absolute -bottom-3 left-1/2 h-6 w-28 sm:w-36 -translate-x-1/2 overflow-hidden rounded-full border border-paper/15 bg-night font-mono text-[10px] text-paper/85">
                      {["→ menu", "→ brunch", "→ events"].map((d, i) => (
                        <span key={d} className="sd-dest absolute inset-0 flex items-center justify-center" style={{ animationDelay: `${i * 2}s` }}>
                          {d}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-paper px-2.5 py-1 font-mono text-[10px] text-ink-soft">
                      carved in
                    </span>
                  )}
                </div>
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
