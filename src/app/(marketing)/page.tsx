import type { Metadata } from "next";
import Link from "next/link";
import { HeroStage } from "@/components/hero/HeroStage";
import { ScanChart } from "@/components/analytics/ScanChart";
import { BreakdownList } from "@/components/analytics/BreakdownList";
import { pricingSoftwareJsonLd } from "@/lib/plans";
import { envClient } from "@/config/env.client";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { Container, Eyebrow, Fig, SectionHeading } from "@/components/site/primitives";
import { Reveal } from "@/components/site/Reveal";
import { PlanCards } from "@/components/site/PlanCards";
import { Faq } from "@/components/site/Faq";
import { FlowDiagram } from "@/components/home/FlowDiagram";
import { TrialSim } from "@/components/home/TrialSim";
import { ShortLinkDemo } from "@/components/home/ShortLinkDemo";
import { CtaBand } from "@/components/site/CtaBand";
import { PrintArtifacts } from "@/components/home/PrintArtifacts";

export const metadata: Metadata = {
  title: { absolute: "Editable QR Codes for Print & Short Links | Scanstone" },
  description:
    "Change your QR code destination after printing. Track scans, share short links, and keep redirects working after cancellation. Start with 3 free codes or links.",
  alternates: { canonical: `${envClient.APP_URL.replace(/\/$/, "")}/` },
  openGraph: {
    title: "Print it once. Update the destination anytime. | Scanstone",
    description:
      "Editable QR codes for menus, packaging, and campaigns. Your redirects keep working after cancellation. Start free.",
    url: `${envClient.APP_URL.replace(/\/$/, "")}/`,
  },
};

const FAQS = [
  {
    q: "Can I shorten a URL without creating a QR code?",
    a: "Yes. Choose Shorten a link to create a compact scst.one URL for messages, social posts, emails, or anywhere you share links. You can update its destination and see click analytics from your dashboard.",
  },
  {
    q: "Do I need an account to create short links?",
    a: "Yes — sign in or create a free account to create and manage short links. The Free plan includes 3 short links or dynamic QR codes in total; Pro includes 500 in total. Anyone can open your short links without an account.",
  },
  {
    q: "Do Scanstone QR codes expire?",
    a: "Static QR patterns have no expiry, though the destination website must stay available. For dynamic codes, cancellation, downgrade, and plan limits do not disable redirects. Deleting a code or your account removes its redirects; dynamic codes also depend on Scanstone and your destination remaining available.",
  },
  {
    q: "What happens to my codes if I stop paying?",
    a: "They keep redirecting. You lose the Pro extras — full analytics history, vector downloads, CSV export — but every printed code keeps working. We think anything else is holding your print materials hostage.",
  },
  {
    q: "Can I change where a printed QR code points?",
    a: "Yes — that's what a dynamic code is for. The printed pattern encodes a permanent short link; you change its destination from the dashboard any time, and every existing print instantly points to the new page.",
  },
  {
    q: "What's the difference between static and dynamic codes?",
    a: "A static code embeds the content itself (URL, WiFi login, contact card) — free, unlimited, and permanent, but not editable after printing. A dynamic code embeds a short redirect link, so you can edit the destination later and see scan counts, locations, and devices.",
  },
  {
    q: "Do you track the people who scan?",
    a: "Minimally and anonymously. We record the scan's country, device type, and time — no cookies, no IP addresses stored, no fingerprinting, no consent banner needed. Enough for you to know what's working; nothing that follows anyone around.",
  },
];

function HomeJsonLd() {
  const origin = envClient.APP_URL.replace(/\/$/, "");
  const data = [
    pricingSoftwareJsonLd(`${origin}/`),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const DEMO_SERIES = {
  days: [
    3, 5, 4, 9, 12, 8, 14, 11, 17, 13, 21, 18, 16, 24, 19, 26, 22, 31, 27, 25,
    34, 29, 38, 33, 30, 41, 36, 44, 39, 47,
  ].map((count, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400_000)
      .toISOString()
      .slice(0, 10),
    count,
  })),
  total: 731,
};

const USES = [
  "Café menus",
  "Salon price lists",
  "Open house signs",
  "Event posters",
  "Table tents",
  "Business cards",
  "Packaging",
  "Window decals",
  "Flyers",
  "Wedding signs",
];

const SEGMENTS = [
  {
    who: "Restaurants & cafés",
    what: "One code on every table, re-pointed each time the menu changes. No reprints, no laminating day.",
    tag: "Menu → Brunch → Happy hour",
    href: "/restaurant-menu-qr-code",
  },
  {
    who: "Salons & studios",
    what: "Put one code by the mirror. Send it to booking today, your price list tomorrow, a holiday promo in December.",
    tag: "Book → Prices → Promo",
  },
  {
    who: "Realtors",
    what: "Print the yard sign once. Point it at the current listing, then the next one. The sign keeps working for years.",
    tag: "Listing → Sold → Next listing",
  },
  {
    who: "Event organizers",
    what: "Posters go up weeks early. Point the code at ticketing now, the schedule on the day, photos after.",
    tag: "Tickets → Schedule → Photos",
  },
  {
    who: "Marketers & agencies",
    what: "Track scans per placement, export CSVs for the client report, swap landing pages mid-campaign.",
    tag: "Per placement · CSV",
  },
  {
    who: "Makers & retail",
    what: "A code on the packaging that always leads to current instructions, manuals, or reorder pages.",
    tag: "Manual → Reorder",
  },
];

export default function LandingPage() {
  return (
    <main id="main">
      <HomeJsonLd />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="gridlines absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          aria-hidden="true"
        />
        <Container className="relative grid items-center gap-14 pb-20 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-28 lg:pt-20">
          <div className="rise">
            <Eyebrow tone="verdigris">Editable QR codes for things you print</Eyebrow>
            <h1 className="display mt-6 text-display text-ink">
              Print it once.
              <br />
              <span className="italic text-verdigris-deep">Update it</span>{" "}
              anytime.
            </h1>
            <p className="mt-7 max-w-xl text-lead text-ink-soft">
              New menu. New offer. Same QR code. Change where your printed
              codes send people, track scans, and share short links from one
              dashboard. Your redirects keep working even if you cancel.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <MarketingLink
                placement="home_hero"
                action="signup"
                href="/signup"
                variant="accent"
                className="!rounded-full px-7 py-3.5 text-base"
              >
                Start free, 3 codes or links
              </MarketingLink>
              <MarketingLink
                placement="home_hero"
                action="demo"
                href="/demo"
                variant="ghost"
                className="!rounded-full px-7 py-3.5 text-base"
              >
                Explore the live demo
              </MarketingLink>
            </div>
            <p className="mt-5 text-sm text-ink-faint">
              No credit card. 3 editable codes or short links. No trial
              deadline.
            </p>
            <Link
              href="/qr-code-generator"
              className="link-underline mt-2 inline-block text-sm text-verdigris-deep"
            >
              Just need a static QR code? Create one without signing up →
            </Link>
          </div>
          <div className="rise [animation-delay:150ms]">
            <HeroStage scenes={["cafe", "salon", "realtor", "events"]} />
          </div>
        </Container>
      </section>

      {/* USES MARQUEE */}
      <section aria-label="Things people print codes on" className="marquee overflow-hidden border-y border-line bg-paper-deep/50 py-5">
        <div className="marquee-track flex w-max gap-10 motion-reduce:flex-wrap">
          {[...USES, ...USES].map((u, n) => (
            <span
              key={`${u}-${n}`}
              aria-hidden={n >= USES.length}
              className="display flex items-center gap-10 whitespace-nowrap text-2xl text-ink-soft"
            >
              {u}
              <span className="text-copper" aria-hidden="true">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" aria-labelledby="how-h" className="scroll-mt-20 py-24 sm:py-32">
        <Container>
          <Reveal>
            <Fig n="01">How it works</Fig>
            <SectionHeading
              id="how-h"
              className="mt-6"
              title={<>Three steps, one stone</>}
              lead="A dynamic code prints a short link instead of your web address. You decide where that link goes, and you can change your mind as often as you like."
            />
          </Reveal>
          <Reveal className="mt-16 sm:mt-20">
            <FlowDiagram />
          </Reveal>
          <Reveal className="mt-20 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "Carve",
                body: "Name your code, point it anywhere, pick the ink and carving style. Download print-ready PNG or vector SVG.",
              },
              {
                n: "Print",
                body: "Menus, table tents, packaging, posters, business cards. The pattern is permanent, so print as many as you like.",
              },
              {
                n: "Re-point, anytime",
                body: "New menu? Event over? Edit the destination in seconds. Every printed code follows. Watch scans roll in by day, country, and device.",
              },
            ].map((s, k) => (
              <div key={s.n} className="rounded-[22px] border border-line bg-white/50 p-7">
                <span className="font-mono text-xs text-copper">0{k + 1}</span>
                <h3 className="display mt-3 text-2xl">{s.n}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* THE PROBLEM */}
      <section id="before-you-print" aria-labelledby="problem-h" className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-24 sm:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <Fig n="02">Before you print</Fig>
            <h2 id="problem-h" className="display mt-6 text-h2">
              Know what happens when the trial ends.
            </h2>
            <p className="mt-6 text-lead text-ink-soft">
              A static QR code stores its destination in the pattern. A dynamic
              code uses a redirect service so you can change that destination.
              Before putting one on menus or packaging, check whether the
              service will still redirect after a trial or subscription ends.
            </p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Scanstone does not disable redirects because you cancel,
              downgrade, or reach your plan limit. You keep control of what you
              print.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-faint">
              QR Code Generator&apos;s own{" "}
              <a
                href="https://support.qr-code-generator.com/hc/en-us/articles/7665046137613-What-happens-to-my-account-and-QR-Codes-when-the-trial-expires"
                className="text-verdigris-deep underline underline-offset-2"
              >
                help center
              </a>{" "}
              says trial codes are deactivated and point to a service page. We
              wrote the opposite into{" "}
              <Link href="/terms" className="text-verdigris-deep underline underline-offset-2">
                our terms
              </Link>
              : if you cancel, the code keeps working.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <TrialSim />
            <p className="mt-3 text-center text-xs text-ink-faint">
              Drag the slider. The left screen is a mock-up of a generic
              deactivated page, not any one company&apos;s.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* THE COVENANT */}
      <section aria-labelledby="covenant-h" className="relative overflow-hidden bg-night text-paper">
        <div className="gridlines-night absolute inset-0" aria-hidden="true" />
        <Container className="relative py-24 sm:py-36">
          <Reveal>
            <Eyebrow tone="paper">The covenant</Eyebrow>
            <h2 id="covenant-h" className="display mt-6 max-w-4xl text-h1">
              Cancelling never stops your redirects.
            </h2>
          </Reveal>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-[24px] border border-night-line bg-night-line sm:grid-cols-3">
            {[
              {
                t: "Cancel your plan",
                d: "Your codes keep redirecting. You lose the extras, not the code.",
              },
              {
                t: "Blow past your limits",
                d: "Scans never get blocked. Limits gate creating codes, never scanning them.",
              },
              {
                t: "Never log in again",
                d: "Codes don't rot with inactivity. Print it and forget it.",
              },
            ].map((c, k) => (
              <Reveal as="li" key={c.t} delay={k * 90} className="bg-night p-8 sm:p-10">
                <span className="flex items-center gap-2 font-mono text-xs text-verdigris-bright">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-verdigris-bright opacity-60 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-verdigris-bright" />
                  </span>
                  Still redirecting
                </span>
                <h3 className="display mt-6 text-2xl">{c.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/65">{c.d}</p>
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 text-sm text-paper/55">
            Deleted codes stop redirecting, and your destination website must
            remain available.{" "}
            <Link href="/terms" className="text-paper underline underline-offset-4">
              Read our redirect promise
            </Link>
            .
          </p>
        </Container>
      </section>

      {/* BENTO */}
      <section aria-labelledby="bento-h" className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <Fig n="03">One dashboard</Fig>
            <SectionHeading
              id="bento-h"
              className="mt-6"
              title="Codes, links and scans, all in one place"
              lead="Everything a small business needs from QR codes. Nothing that needs a sales call."
            />
          </Reveal>

          <div className="mt-16 grid gap-4 lg:grid-cols-6">
            {/* Short links */}
            <Reveal className="lg:col-span-4" >
              <div id="short-links" className="scroll-mt-24 h-full rounded-[28px] border border-line bg-paper-deep/50 p-6 sm:p-10">
                <Eyebrow>URL shortener · scst.one</Eyebrow>
                <div className="mt-5 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
                  <div>
                    <h3 className="display text-h3 sm:text-4xl">Long URL. Short link.</h3>
                    <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                      Turn a long web address into a compact scst.one link.
                      Share it in a text, email, social post, or bio, then
                      update its destination and track clicks from the same
                      dashboard as your QR codes.
                    </p>
                    <Link
                      href="/dashboard/shorten"
                      className="mt-6 inline-flex rounded-full bg-verdigris px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-verdigris-deep"
                    >
                      Create a short link
                    </Link>
                    <p className="mt-3 text-xs text-ink-faint">
                      Sign in or create a free account. Your first 3 short
                      links or dynamic QR codes are free, with one shared
                      limit.
                    </p>
                  </div>
                  <ShortLinkDemo />
                </div>
              </div>
            </Reveal>

            {/* Privacy */}
            <Reveal className="lg:col-span-2" delay={80}>
              <div className="flex h-full flex-col justify-between rounded-[28px] bg-night p-8 text-paper">
                <Eyebrow tone="paper">Privacy</Eyebrow>
                <div className="mt-10">
                  <h3 className="display text-3xl">Anonymous counts, not surveillance.</h3>
                  <p className="mt-4 text-sm leading-relaxed text-paper/65">
                    No cookies, no stored IPs, no consent banners. We record the
                    scan&apos;s country, device type, and time. That&apos;s it.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Analytics */}
            <Reveal className="lg:col-span-3">
              <div className="h-full rounded-[28px] border border-line bg-white/60 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Eyebrow>Know what the paper is doing</Eyebrow>
                    <h3 className="display mt-4 text-3xl">Print, finally measurable</h3>
                  </div>
                  <span className="eyebrow shrink-0 rounded-full border border-line px-2.5 py-1 text-ink-faint">
                    Sample data
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  Every scan is counted the moment it happens: when, where,
                  what device. Compare the poster by the door against the table
                  tents.
                </p>
                <div className="mt-6">
                  <ScanChart series={DEMO_SERIES} title="Last 30 days (demo data)" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-6">
                  <BreakdownList
                    title="Devices"
                    items={[
                      { label: "mobile", count: 655, share: 0.9 },
                      { label: "tablet", count: 47, share: 0.06 },
                      { label: "desktop", count: 29, share: 0.04 },
                    ]}
                  />
                  <BreakdownList
                    title="Countries"
                    items={[
                      { label: "Canada", count: 587, share: 0.8 },
                      { label: "United States", count: 96, share: 0.13 },
                      { label: "United Kingdom", count: 48, share: 0.07 },
                    ]}
                  />
                </div>
                <Link href="/demo" className="link-underline mt-6 inline-block text-sm text-verdigris-deep">
                  Explore the live demo →
                </Link>
              </div>
            </Reveal>

            {/* Print + free generator */}
            <Reveal className="lg:col-span-3" delay={80}>
              <div className="grid h-full gap-4">
                <div className="rounded-[28px] border border-line bg-white/60 p-6 sm:p-8">
                  <Eyebrow>Print-ready</Eyebrow>
                  <h3 className="display mt-4 text-3xl">PNG for the office printer. SVG for the print shop.</h3>
                  <PrintArtifacts />
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["2048px PNG", "Vector SVG (Pro)", "Ink colours", "Cut · Worn · Pebble"].map((t) => (
                      <span key={t} className="rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-xs text-ink-soft">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/qr-code-generator"
                  className="group flex items-center justify-between gap-6 rounded-[28px] bg-verdigris p-6 text-paper transition hover:bg-verdigris-deep sm:p-8"
                >
                  <span>
                    <span className="eyebrow text-paper/70">Free, no sign-up</span>
                    <span className="display mt-3 block text-2xl sm:text-3xl">
                      Make a static QR code right now
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-3xl transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* WHO IT'S FOR */}
      <section aria-labelledby="who-h" className="border-t border-line bg-paper-deep/40 py-24 sm:py-32">
        <Container>
          <Reveal>
            <Fig n="04">Who it&apos;s for</Fig>
            <SectionHeading id="who-h" className="mt-6" title="Made for things that get printed" />
          </Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SEGMENTS.map((seg, k) => {
              const inner = (
                <>
                  <h3 className="display text-2xl">{seg.who}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{seg.what}</p>
                  <p className="mt-6 font-mono text-xs text-verdigris-deep">{seg.tag}</p>
                </>
              );
              return (
                <Reveal key={seg.who} delay={(k % 3) * 70}>
                  {seg.href ? (
                    <Link href={seg.href} className="block h-full rounded-[22px] border border-line bg-white/55 p-7 transition hover:-translate-y-0.5 hover:border-ink-faint hover:shadow-[var(--shadow-card)]">
                      {inner}
                      <span className="mt-4 block text-sm text-ink">Menu QR codes →</span>
                    </Link>
                  ) : (
                    <div className="h-full rounded-[22px] border border-line bg-white/55 p-7">{inner}</div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* PRICING */}
      <section id="pricing" aria-labelledby="pricing-h" className="scroll-mt-20 py-24 sm:py-32">
        <Container className="max-w-5xl">
          <Reveal>
            <SectionHeading
              id="pricing-h"
              center
              eyebrow="Pricing"
              title="Honest pricing, stated plainly"
              lead="Start free. Upgrade when you need more codes or the full history."
            />
          </Reveal>
          <Reveal className="mt-12">
            <PlanCards />
          </Reveal>
          <p className="mt-8 text-center text-sm text-ink-faint">
            Cancel anytime, self-serve, from your account page. Codes and links
            keep working after. See the covenant above.
          </p>
        </Container>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-h" className="border-t border-line py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Fig n="05">FAQ</Fig>
            <h2 id="faq-h" className="display mt-6 text-h2">
              Questions, answered straight
            </h2>
            <p className="mt-5 text-ink-soft">
              Something else? Email{" "}
              <a href="mailto:hello@scanstone.ca" className="text-verdigris-deep underline underline-offset-2">
                hello@scanstone.ca
              </a>
              . A person reads it.
            </p>
          </div>
          <Faq items={FAQS} />
        </Container>
      </section>

      <CtaBand
        title="The next thing you print deserves a code that lasts."
        body={
          <>
            Three short links or dynamic QR codes free. Unlimited static codes
            free. {envClient.APP_URL.replace(/^https?:\/\//, "")} will keep
            them alive.
          </>
        }
      />
    </main>
  );
}
