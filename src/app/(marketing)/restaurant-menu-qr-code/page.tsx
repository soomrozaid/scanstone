import type { Metadata } from "next";
import Link from "next/link";
import { HeroStage } from "@/components/hero/HeroStage";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { Container, Eyebrow, Fig } from "@/components/site/primitives";
import { Reveal } from "@/components/site/Reveal";
import { Faq } from "@/components/site/Faq";
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
      <section className="relative overflow-hidden">
        <div
          className="gridlines absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          aria-hidden="true"
        />
        <Container className="relative grid items-center gap-14 pb-20 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
          <div className="rise">
            <nav aria-label="Breadcrumb" className="eyebrow text-ink-faint">
              <Link href="/" className="hover:text-ink">Home</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-verdigris">For restaurants &amp; cafés</span>
            </nav>
            <h1 className="display mt-6 text-display">
              Change the menu.
              <br />
              <span className="italic text-verdigris-deep">Keep the QR code.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lead text-ink-soft">
              A dynamic restaurant menu QR code lets you change the menu link
              after printing. Keep the same table cards, update the
              destination, and see how often guests scan.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <MarketingLink
                placement="restaurant_hero"
                action="signup"
                href="/signup"
                variant="accent"
                className="!rounded-full px-7 py-3.5 text-base"
              >
                Create a free menu code
              </MarketingLink>
              <MarketingLink
                placement="restaurant_hero"
                action="static_generator"
                href="/qr-code-generator"
                variant="ghost"
                className="!rounded-full px-7 py-3.5 text-base"
              >
                Use a static code
              </MarketingLink>
            </div>
            <p className="mt-5 text-sm text-ink-faint">
              3 editable codes or short links free. No credit card.
            </p>
            <p className="mt-2 text-sm text-ink-faint">
              Bring your existing menu webpage or public PDF link. Scanstone
              does not host your menu.
            </p>
          </div>
          <div className="rise [animation-delay:150ms]">
            <HeroStage />
          </div>
        </Container>
      </section>

      <section aria-labelledby="steps-h" className="border-y border-line bg-paper-deep/40 py-24 sm:py-32">
        <Container>
          <Reveal>
            <Fig n="01">Setup</Fig>
            <h2 id="steps-h" className="display mt-6 text-h2">From menu link to table card</h2>
          </Reveal>
          <ol className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Link your menu", "Open your menu URL in a private browser window. It should load without asking guests to sign in. Use that URL as the destination for a new dynamic code."],
              ["02", "Test the printed version", "Download the PNG, print a sample at its intended size, and scan it on more than one phone. Keep a clear margin around the code and check it in your dining-room lighting."],
              ["03", "Update without reprinting", "When your menu moves to a new URL, edit the code’s destination in your dashboard. Use separate codes for tables and takeaway bags if you want to compare their scan counts."],
            ].map(([n, heading, body], k) => (
              <Reveal as="li" key={n} delay={k * 80} className="relative rounded-[24px] border border-line bg-white/60 p-7 sm:p-8">
                <span className="display text-6xl text-verdigris/25">{n}</span>
                <h3 className="display mt-4 text-2xl">{heading}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
              </Reveal>
            ))}
          </ol>
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

      <section aria-labelledby="menu-faq" className="border-t border-line bg-paper-deep/40 py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Fig n="03">FAQ</Fig>
            <h2 id="menu-faq" className="display mt-6 text-h2">Restaurant menu QR codes, explained</h2>
            <p className="mt-6 text-ink-soft">
              Start free, then upgrade if you need more codes, full scan
              history, or vector downloads.{" "}
              <Link href="/pricing" className="text-verdigris-deep underline underline-offset-2">Compare plans</Link>{" "}
              or{" "}
              <Link href="/demo" className="text-verdigris-deep underline underline-offset-2">explore the live demo</Link>.
            </p>
          </div>
          <Faq items={questions} allOpen />
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
