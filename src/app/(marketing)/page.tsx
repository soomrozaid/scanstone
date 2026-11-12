import type { Metadata } from "next";
import Link from "next/link";
import { HeroStage } from "@/components/hero/HeroStage";
import { CinemaHero } from "@/components/cinema/CinemaHero";
import { SplitWords } from "@/components/cinema/SplitWords";
import { LazyVideo } from "@/components/cinema/LazyVideo";
import { LazyScanStory } from "@/components/cinema/LazyScanStory";
import { VideoType } from "@/components/cinema/VideoType";
import { HorizontalGallery } from "@/components/cinema/HorizontalGallery";
import { SegmentCard } from "@/components/cinema/SegmentCard";
import { StackCards } from "@/components/cinema/StackCards";
import { renderQRSvg } from "@/lib/qr/svg";
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
import { ScanTicker } from "@/components/home/ScanTicker";
import { CtaBand } from "@/components/site/CtaBand";
import { PrintArtifacts } from "@/components/home/PrintArtifacts";
import { MiniCustomizer } from "@/components/home/MiniCustomizer";
import { StickyCta } from "@/components/site/StickyCta";
import { Spotlight } from "@/components/site/Spotlight";

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
    a: "Yes. Sign in or create a free account to create and manage short links. The Free plan includes 3 short links or dynamic QR codes in total; Pro includes 500 in total. Anyone can open your short links without an account.",
  },
  {
    q: "Do Scanstone QR codes expire?",
    a: "Static QR patterns have no expiry, though the destination website must stay available. For dynamic codes, cancellation, downgrade, and plan limits do not disable redirects. Deleting a code or your account removes its redirects; dynamic codes also depend on Scanstone and your destination remaining available.",
  },
  {
    q: "What happens to my codes if I stop paying?",
    a: "They keep redirecting. You lose the Pro extras (full analytics history, vector downloads, CSV export), but every printed code keeps working. We think anything else is holding your print materials hostage.",
  },
  {
    q: "Can I change where a printed QR code points?",
    a: "Yes, that's what a dynamic code is for. The printed pattern encodes a permanent short link; you change its destination from the dashboard any time, and every existing print instantly points to the new page.",
  },
  {
    q: "What's the difference between static and dynamic codes?",
    a: "A static code embeds the content itself (URL, WiFi login, contact card). It's free, unlimited, and permanent, but not editable after printing. A dynamic code embeds a short redirect link, so you can edit the destination later and see scan counts, locations, and devices.",
  },
  {
    q: "Do you track the people who scan?",
    a: "Minimally and anonymously. We record the scan's country, device type, and time. No cookies, no IP addresses stored, no fingerprinting, no consent banner needed. Enough for you to know what's working; nothing that follows anyone around.",
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

const SEGMENTS = [
  {
    who: "Restaurants & cafés",
    shape: "tent" as const,
    tint: "rgba(224,138,70,0.35)",
    what: "One code on every table, re-pointed each time the menu changes. No reprints, no laminating day.",
    tag: "Menu → Brunch → Happy hour",
    href: "/restaurant-menu-qr-code",
  },
  {
    who: "Salons & studios",
    shape: "mirror" as const,
    tint: "rgba(79,174,155,0.35)",
    what: "Put one code by the mirror. Send it to booking today, your price list tomorrow, a holiday promo in December.",
    tag: "Book → Prices → Promo",
  },
  {
    who: "Realtors",
    shape: "sign" as const,
    tint: "rgba(224,138,70,0.3)",
    what: "Print the yard sign once. Point it at the current listing, then the next one. The sign keeps working for years.",
    tag: "Listing → Sold → Next listing",
  },
  {
    who: "Event organizers",
    shape: "poster" as const,
    tint: "rgba(79,174,155,0.4)",
    what: "Posters go up weeks early. Point the code at ticketing now, the schedule on the day, photos after.",
    tag: "Tickets → Schedule → Photos",
  },
  {
    who: "Marketers & agencies",
    shape: "report" as const,
    tint: "rgba(224,138,70,0.3)",
    what: "Track scans per placement, export CSVs for the client report, swap landing pages mid-campaign.",
    tag: "Per placement · CSV",
  },
  {
    who: "Makers & retail",
    shape: "box" as const,
    tint: "rgba(79,174,155,0.35)",
    what: "A code on the packaging that always leads to current instructions, manuals, or reorder pages.",
    tag: "Manual → Reorder",
  },
];

export default function LandingPage() {
  return (
    <main id="main">
      <HomeJsonLd />
      <StickyCta />

      {/* HERO */}
      <CinemaHero
        url={`${envClient.APP_URL}/demo`}
        poster={
          <div
            className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{
              __html: renderQRSvg(`${envClient.APP_URL}/demo`, {
                fg: "#171512",
                bg: "#efe7d6",
                quietZone: 3,
              }),
            }}
          />
        }
      >
        <Container className="pb-14 pt-[calc(33.5svh+84px)] sm:pb-20 lg:pt-40">
          <div className="max-w-3xl">
            <Eyebrow tone="verdigris" className="rise !text-verdigris-bright">
              Editable QR codes for things you print
            </Eyebrow>
            <h1 className="display mt-5 text-[clamp(3.1rem,8vw,7.25rem)] sm:mt-6 leading-[0.92] tracking-[-0.03em] text-paper">
              <SplitWords text="Print it once." start={80} />
              <br />
              <SplitWords
                text="Update it"
                start={300}
                wordClass="italic text-verdigris-bright"
              />{" "}
              <SplitWords text="anytime." start={440} />
            </h1>
            <p className="mt-6 max-w-xl text-lead text-paper/70 sm:mt-8">
              New menu. New offer. Same QR code. Change where your printed
              codes send people, track scans, and share short links from one
              dashboard. Your redirects keep working even if you cancel.
            </p>
            <div className="rise mt-7 flex flex-wrap items-center gap-3 [animation-delay:700ms] sm:mt-9">
              <span data-magnetic className="inline-block">
                <MarketingLink
                  placement="home_hero"
                  action="signup"
                  href="/signup"
                  variant="accent"
                  className="!rounded-full !bg-verdigris-bright px-7 py-3.5 text-base !text-night hover:!bg-paper"
                >
                  Start free, 3 codes or links
                </MarketingLink>
              </span>
              <span data-magnetic className="inline-block">
                <MarketingLink
                  placement="home_hero"
                  action="demo"
                  href="/demo"
                  variant="ghost"
                  className="!rounded-full border border-paper/25 px-7 py-3.5 text-base !text-paper hover:!bg-paper/10"
                >
                  Explore the live demo
                </MarketingLink>
              </span>
            </div>
            <p className="mt-5 text-sm text-paper/55">
              No credit card. 3 editable codes or short links. No trial
              deadline.{" "}
              <Link
                href="/qr-code-generator"
                className="link-underline text-verdigris-bright"
              >
                Just need a static QR code? Create one without signing up →
              </Link>
            </p>
          </div>
        </Container>
      </CinemaHero>

      {/* KINETIC TYPE OVER VIDEO */}
      <VideoType
        label="Things people print codes on"
        lines={["Menus", "Table tents", "Packaging", "Open house signs", "Event posters"]}
      />

      {/* HOW IT WORKS */}
      <LazyScanStory qrUrl={`${envClient.APP_URL}/demo`} />
      <section id="how-it-works-static" aria-labelledby="how-h-static" className="hidden scroll-mt-20 py-24 motion-reduce:block sm:py-32">
        <Container>
          <Reveal>
            <Fig n="01">How it works</Fig>
            <SectionHeading
              id="how-h-static"
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

      {/* TRY IT */}
      <section aria-labelledby="try-h" className="relative overflow-hidden py-24 sm:py-32">
        <div className="gridlines absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden="true" />
        <Container className="relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <Fig n="00">Try it</Fig>
            <SectionHeading
              id="try-h"
              className="mt-6"
              title={<>One code on the table. <em className="text-verdigris-deep">You pick where it goes.</em></>}
              lead="Switch the business below and watch the same printed code open a different page. That's the whole idea. Cancelling never stops your redirects, either."
            />
          </Reveal>
          <HeroStage
            scenes={["cafe", "salon", "realtor", "events"]}
            demoUrl={`${envClient.APP_URL}/demo`}
          />
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

      {/* CHECKLIST: stacking cards */}
      <section aria-labelledby="ask-h" className="bg-paper-deep/40 py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Checklist</Eyebrow>
            <h2 id="ask-h" className="display mt-4 text-[clamp(2.2rem,4.4vw,3.8rem)] leading-[1] tracking-[-0.02em]">
              Four questions to ask any QR generator
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-soft">
              Ask these before you print, wherever you make your codes.
              Here&apos;s how we answer them.
            </p>
          </div>
          <StackCards
            items={[
              { q: "Does the code stop if I stop paying?", verdict: "No.", a: "Cancelling, downgrading or going over your limit never turns off a redirect." },
              { q: "Is there a scan cap?", verdict: "No.", a: "Limits only apply to creating codes, never to scanning them." },
              { q: "Can I change where it points after printing?", verdict: "Yes.", a: "On dynamic codes and short links. Static codes are fixed by design." },
              { q: "Who sees my scanners' data?", verdict: "You.", a: "Nobody but you, and only country, device and time. No cookies or stored IPs." },
            ]}
          />
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
              <Spotlight className="rounded-[28px] border border-line bg-paper-deep/50 p-6 sm:p-10" max={4}>
              <div id="short-links" className="scroll-mt-24">
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
                  <div data-depth>
                    <ShortLinkDemo />
                  </div>
                </div>
              </div>
              </Spotlight>
            </Reveal>

            {/* Privacy */}
            <Reveal className="lg:col-span-2" delay={80}>
              <Spotlight className="flex flex-col justify-between rounded-[28px] bg-night p-8 text-paper">
                <Eyebrow tone="paper">Privacy</Eyebrow>
                <div className="mt-10">
                  <h3 className="display text-3xl">Anonymous counts, not surveillance.</h3>
                  <p className="mt-4 text-sm leading-relaxed text-paper/65">
                    No cookies, no stored IPs, no consent banners. We record the
                    scan&apos;s country, device type, and time. That&apos;s it.
                  </p>
                </div>
                <ScanTicker />
              </Spotlight>
            </Reveal>

            {/* Analytics */}
            <Reveal className="lg:col-span-3">
              <Spotlight className="h-full rounded-[28px] border border-line bg-white/60 p-6 sm:p-8">
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
              </Spotlight>
            </Reveal>

            {/* Print + free generator */}
            <Reveal className="lg:col-span-3" delay={80}>
              <div className="grid h-full gap-4">
                <Spotlight className="rounded-[28px] border border-line bg-white/60 p-6 sm:p-8">
                  <Eyebrow>Print-ready</Eyebrow>
                  <h3 className="display mt-4 text-3xl">PNG for the office printer. SVG for the print shop.</h3>
                  <div data-depth><PrintArtifacts /></div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["2048px PNG", "Vector SVG (Pro)", "Ink colours", "Cut · Worn · Pebble"].map((t) => (
                      <span key={t} className="rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-xs text-ink-soft">
                        {t}
                      </span>
                    ))}
                  </div>
                </Spotlight>
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

      {/* CUSTOMIZER */}
      <section aria-labelledby="custom-h" className="border-t border-line py-24 sm:py-32">
        <Container>
          <Reveal>
            <Fig n="04">Make it yours</Fig>
            <SectionHeading
              id="custom-h"
              className="mt-6"
              title="Your colours. Still scans."
              lead="Pick an ink and a carving style. Low-contrast combos get blocked in the real generator, so what you print always works."
            />
          </Reveal>
          <Reveal className="mt-14">
            <MiniCustomizer />
          </Reveal>
        </Container>
      </section>

      {/* WHO IT'S FOR: sideways gallery */}
      <HorizontalGallery
        heading={
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-bright">Fig. 05 / Who it&apos;s for</p>
            <h2 id="who-h" className="display mt-4 text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[0.95] tracking-[-0.025em]">
              Made for things that <em className="text-verdigris-bright">get printed</em>
            </h2>
          </>
        }
      >
        {SEGMENTS.map((seg, k) => (
          <SegmentCard
            key={seg.who}
            n={k + 1}
            total={SEGMENTS.length}
            who={seg.who}
            what={seg.what}
            steps={seg.tag.split(/ → | · /)}
            shape={seg.shape}
            tint={seg.tint}
            href={seg.href}
          />
        ))}
      </HorizontalGallery>

      {/* PRICING */}
      <section id="pricing" aria-labelledby="pricing-h" className="cv-auto scroll-mt-20 py-24 sm:py-32">
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
      <section aria-labelledby="faq-h" data-nav="dark" className="cv-auto relative overflow-hidden bg-night py-24 text-paper sm:py-32">
        <div className="aurora pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <Container className="relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-bright">Fig. 06 / FAQ</p>
            <h2 id="faq-h" className="display mt-6 text-h2">
              <SplitWords text="Questions, answered straight" />
            </h2>
            <p className="mt-5 text-paper/70">
              Something else? Email{" "}
              <a href="mailto:hello@scanstone.ca" className="text-verdigris-bright underline underline-offset-2">
                hello@scanstone.ca
              </a>
              . A person reads it.
            </p>
            {/* A giant question mark with the tile light playing inside it. */}
            <div aria-hidden="true" className="q-float relative mt-10 hidden w-fit select-none overflow-hidden rounded-[2rem] [mask-image:radial-gradient(closest-side,black_70%,transparent)] lg:block">
              <LazyVideo className="absolute inset-0 h-full w-full" />
              <p className="display pointer-events-none relative bg-black px-10 text-[19rem] italic leading-[0.95] text-white mix-blend-multiply">?</p>
            </div>
          </div>
          <Faq items={FAQS} tone="night" />
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
