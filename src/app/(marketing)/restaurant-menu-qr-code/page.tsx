import type { Metadata } from "next";
import Link from "next/link";
import { HeroStage } from "@/components/hero/HeroStage";
import { CinemaHero } from "@/components/cinema/CinemaHero";
import { SplitWords } from "@/components/cinema/SplitWords";
import { renderQRSvg } from "@/lib/qr/svg";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { Container, Eyebrow, Fig } from "@/components/site/primitives";
import { Reveal } from "@/components/site/Reveal";
import { Faq } from "@/components/site/Faq";
import { StackCards } from "@/components/cinema/StackCards";
import { DayCycle } from "@/components/cinema/DayCycle";
import { AssembleQR } from "@/components/cinema/AssembleQR";
import { CtaBand } from "@/components/site/CtaBand";
import { TrialSim } from "@/components/home/TrialSim";
import { envClient } from "@/config/env.client";

const title = "Restaurant Menu QR Codes You Can Update After Printing";
const description =
  "Create a QR code for your restaurant menu. Change the menu link without reprinting table cards, track scans, and start with 3 free dynamic codes.";
const path = "/restaurant-menu-qr-code";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { title, description, url: path },
};

const questions = [
  {
    q: "How do I make a QR code for a restaurant menu?",
    a: "Put your menu on a publicly accessible webpage or PDF URL, create a dynamic QR code with that URL in Scanstone, then download and test it before printing. Scanstone links to your menu; it does not host PDFs or build a menu website.",
  },
  {
    q: "Can I change my menu after printing the QR code?",
    a: "Yes. For a dynamic code, edit the destination URL in your dashboard. The printed QR pattern stays the same. If you update the menu content at the same URL, you do not need to change the destination at all.",
  },
  {
    q: "Is a static or dynamic QR code better for a menu?",
    a: "Use a static code if you control a permanent menu URL and do not need scan analytics. Use a dynamic code if the URL might change or you want scan counts. Static codes are free without an account; the free account includes 3 dynamic codes or short links in total.",
  },
  {
    q: "What happens if I cancel my Scanstone subscription?",
    a: "Cancellation does not disable your redirects. You lose Pro features, but your existing codes still redirect. Deleting a code or your account stops its redirects, and your menu website must remain available.",
  },
  {
    q: "Do guests need an app or an account?",
    a: "Guests do not need a Scanstone account. They can scan the code with a compatible phone camera and open your menu in their browser. Make sure the menu itself is public and does not require a login.",
  },
];

export default function RestaurantMenuPage() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: `${envClient.APP_URL}${path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: envClient.APP_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Restaurant menu QR codes",
          item: `${envClient.APP_URL}${path}`,
        },
      ],
    },
  ];
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, "\\u003c"),
        }}
      />
      <CinemaHero
        url={`${envClient.APP_URL}/demo`}
        dests={[
          { biz: "Lunch", url: "yourcafe.ca/menu", note: "" },
          { biz: "Weekend", url: "yourcafe.ca/brunch", note: "" },
          { biz: "Happy hour", url: "yourcafe.ca/drinks", note: "" },
          { biz: "Holidays", url: "yourcafe.ca/holiday.pdf", note: "" },
        ]}
        poster={
          <div
            className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{
              __html: renderQRSvg(`${envClient.APP_URL}/demo`, { fg: "#171512", bg: "#efe7d6", quietZone: 3 }),
            }}
          />
        }
      >
        <Container className="pb-14 pt-[calc(33.5svh+84px)] sm:pb-20 lg:pt-40">
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="eyebrow rise text-paper/50">
              <Link href="/" className="hover:text-paper">Home</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-verdigris-bright">For restaurants &amp; cafés</span>
            </nav>
            <h1 className="display mt-6 text-[clamp(3rem,7.4vw,6.8rem)] leading-[0.92] tracking-[-0.03em] text-paper">
              <SplitWords text="Change the menu." start={80} />
              <br />
              <SplitWords text="Keep the QR code." start={320} wordClass="italic text-verdigris-bright" />
            </h1>
            <p className="mt-7 max-w-xl text-lead text-paper/70">
              A dynamic restaurant menu QR code lets you change the menu link
              after printing. Keep the same table cards, update the
              destination, and see how often guests scan.
            </p>
            <div className="rise mt-9 flex flex-wrap gap-3 [animation-delay:650ms]">
              <span data-magnetic className="inline-block">
                <MarketingLink
                  placement="restaurant_hero"
                  action="signup"
                  href="/signup"
                  variant="accent"
                  className="!rounded-full !bg-verdigris-bright px-7 py-3.5 text-base !text-night hover:!bg-paper"
                >
                  Create a free menu code
                </MarketingLink>
              </span>
              <span data-magnetic className="inline-block">
                <MarketingLink
                  placement="restaurant_hero"
                  action="static_generator"
                  href="/qr-code-generator"
                  variant="ghost"
                  className="!rounded-full border border-paper/25 px-7 py-3.5 text-base !text-paper hover:!bg-paper/10"
                >
                  Use a static code
                </MarketingLink>
              </span>
            </div>
            <p className="mt-5 text-sm text-paper/55">
              3 editable codes or short links free. No credit card. Bring your
              existing menu webpage or public PDF link. Scanstone does not host
              your menu.
            </p>
          </div>
        </Container>
      </CinemaHero>

      <section aria-label="Try it" className="relative overflow-hidden py-20 sm:py-28">
        <div className="gridlines absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden="true" />
        <Container className="relative max-w-3xl">
          <HeroStage demoUrl={`${envClient.APP_URL}/demo`} />
        </Container>
      </section>

      <DayCycle qr={<AssembleQR lite data="https://www.scanstone.ca/restaurant-menu-qr-code" label="" className="!rounded-md !p-[4%]" />} />

      <section aria-labelledby="steps-h" className="border-y border-line bg-paper-deep/40 py-24 sm:py-32">
        <Container>
          <Reveal>
            <Fig n="01">Setup</Fig>
            <h2 id="steps-h" className="display mt-6 text-h2">From menu link to table card</h2>
          </Reveal>
          <div className="mt-14">
            <StackCards
              items={[
                { verdict: "Link.", q: "Link your menu", a: "Open your menu URL in a private browser window. It should load without asking guests to sign in. Use that URL as the destination for a new dynamic code." },
                { verdict: "Test.", q: "Test the printed version", a: "Download the PNG, print a sample at its intended size, and scan it on more than one phone. Keep a clear margin around the code and check it in your dining-room lighting." },
                { verdict: "Update.", q: "Update without reprinting", a: "When your menu moves to a new URL, edit the code’s destination in your dashboard. Use separate codes for tables and takeaway bags if you want to compare their scan counts." },
              ]}
            />
          </div>
        </Container>
      </section>

      <section aria-labelledby="print-h" className="py-24 sm:py-32">
        <Container className="grid items-start gap-14 lg:grid-cols-2">
          <Reveal>
            <Fig n="02">Checklist</Fig>
            <h2 id="print-h" className="display mt-6 text-h2">Before you print the whole batch</h2>
            <ul className="mt-10 space-y-4">
              {[
                "Use dark marks on a light background and leave the code’s clear border intact.",
                "Check the menu on a phone over mobile data, not only your staff WiFi.",
                "Put “Scan for our menu” beside it, plus a readable menu URL for guests who cannot scan.",
                "Keep a printed menu available and avoid placing codes across folds or reflective surfaces.",
              ].map((t, k) => (
                <li key={t} className="flex gap-4 border-b border-line pb-4 text-ink-soft">
                  <span className="font-mono text-xs text-copper">0{k + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-soft">
              Need a guest network code too? Use the{" "}
              <Link href="/wifi-qr-code-generator" className="text-verdigris-deep underline underline-offset-2">
                free WiFi QR generator
              </Link>
              .
            </p>
          </Reveal>
          <Reveal delay={100}>
            <Eyebrow>What if you stop paying?</Eyebrow>
            <div className="mt-5">
              <TrialSim />
            </div>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="menu-faq" data-nav="dark" className="night-portal relative overflow-hidden bg-night py-24 text-paper sm:py-32">
        <div className="aurora pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <Container className="relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-bright">Fig. 03 / FAQ</p>
            <h2 id="menu-faq" className="display mt-6 text-h2">Restaurant menu QR codes, explained</h2>
            <p className="mt-6 text-paper/70">
              Start free, then upgrade if you need more codes, full scan
              history, or vector downloads.{" "}
              <Link href="/pricing" className="text-verdigris-bright underline underline-offset-2">Compare plans</Link>{" "}
              or{" "}
              <Link href="/demo" className="text-verdigris-bright underline underline-offset-2">explore the live demo</Link>.
            </p>
          </div>
          <Faq items={questions} allOpen tone="night" />
        </Container>
      </section>

      <div className="pt-24 sm:pt-32">
        <CtaBand
          title="Your next menu change shouldn't mean a reprint."
          body="Make one free menu code, put it on every table, and point it wherever you like."
          primary={{ href: "/signup", label: "Create a free menu code" }}
          secondary={{ href: "/demo", label: "See the live demo" }}
        />
      </div>
    </main>
  );
}
