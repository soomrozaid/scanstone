import type { Metadata } from "next";
import { DarkHero } from "@/components/cinema/DarkHero";
import { SplitWords } from "@/components/cinema/SplitWords";
import Link from "next/link";
import { Container, Eyebrow, Fig } from "@/components/site/primitives";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/CtaBand";

export const metadata: Metadata = {
  title: "About",
  description:
    "Scanstone is a small, independent product built in Saskatchewan, Canada. Printed QR codes shouldn't stop working when a subscription lapses.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

const PRINCIPLES = [
  {
    t: "Printed things should keep working",
    d: "A menu, a sign or a box of business cards costs real money. The code on it shouldn't die because a trial ended or a card expired. So our redirects don't stop when you stop paying, and that's written into our terms.",
    link: { href: "/terms", label: "Read the covenant" },
  },
  {
    t: "Count scans, not people",
    d: "We record the country, device type and time of a scan. No cookies, no stored IP addresses, no fingerprinting. Enough to know the poster by the door works.",
    link: { href: "/privacy", label: "Read the privacy policy" },
  },
  {
    t: "Prices you can read in one breath",
    d: "Free for 3 editable codes and unlimited static ones. Pro is $9 USD a month or $79 USD a year. No sales calls, no setup fees.",
    link: { href: "/pricing", label: "See pricing" },
  },
];

export default function AboutPage() {
  return (
    <main id="main">
      <DarkHero glow="20% 30%">
        <Container className="relative pb-24 pt-16 sm:pb-32 sm:pt-24">
          <Eyebrow tone="verdigris" className="rise !text-verdigris-bright">About Scanstone</Eyebrow>
          <h1 className="display mt-6 max-w-5xl text-[clamp(4rem,12vw,11rem)] leading-[0.9] tracking-[-0.035em]">
            <SplitWords text="About" start={60} />
          </h1>
          <div className="rise mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <p className="display max-w-3xl text-[clamp(1.6rem,1.2rem+1.4vw,2.6rem)] leading-[1.15] text-paper">
              Scanstone is a small, independent product built in Saskatchewan,
              Canada. We built it because printed QR codes{" "}
              <span className="italic text-verdigris-bright">
                shouldn&apos;t stop working
              </span>{" "}
              when a subscription lapses.
            </p>
            <div className="self-end text-paper/65 lg:border-l lg:border-white/10 lg:pl-10">
              <p>
                Questions, or just want to say hello? Write to{" "}
                <a
                  href="mailto:hello@scanstone.ca"
                  className="text-verdigris-bright underline underline-offset-2"
                >
                  hello@scanstone.ca
                </a>
                . A person reads every email.
              </p>
            </div>
          </div>
        </Container>
      </DarkHero>

      <section aria-labelledby="principles-h" className="border-t border-line bg-paper-deep/40 py-24 sm:py-32">
        <Container>
          <Reveal>
            <Fig n="01">What we care about</Fig>
            <h2 id="principles-h" className="display mt-6 text-h2">Three things we won&apos;t budge on</h2>
          </Reveal>
          <ol className="mt-14 grid gap-4 lg:grid-cols-3">
            {PRINCIPLES.map((p, k) => (
              <Reveal as="li" key={p.t} delay={k * 80} className="flex flex-col rounded-[24px] border border-line bg-white/60 p-7 sm:p-8">
                <span className="font-mono text-xs text-copper">0{k + 1}</span>
                <h3 className="display mt-4 text-2xl">{p.t}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{p.d}</p>
                <Link href={p.link.href} className="link-underline mt-6 self-start text-sm text-verdigris-deep">
                  {p.link.label} →
                </Link>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <div className="pt-24 sm:pt-32">
        <CtaBand
          title="Make a code that outlasts the print run."
          body="Three editable codes free, no card. Static codes free forever."
        />
      </div>
    </main>
  );
}
