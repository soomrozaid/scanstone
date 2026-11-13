import type { Metadata } from "next";
import Link from "next/link";
import { pricingSoftwareJsonLd } from "@/lib/plans";
import { Container, Eyebrow, Fig } from "@/components/site/primitives";
import { PlanCards } from "@/components/site/PlanCards";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { envClient } from "@/config/env.client";
import { DarkHero } from "@/components/cinema/DarkHero";
import { SplitWords } from "@/components/cinema/SplitWords";
import { PromiseSeal } from "@/components/cinema/PromiseSeal";
import { CompareTable } from "@/components/cinema/CompareTable";
import { VelocityBand } from "@/components/cinema/VelocityBand";

export const metadata: Metadata = {
  title: "Pricing — Free forever plan, Pro at $9 USD/month",
  description:
    "Scanstone pricing: unlimited static QR codes, 3 free short links or dynamic QR codes, and Pro at $9 USD/month for 500 total with full analytics. Redirects never expire.",
  alternates: { canonical: "/pricing" },
};

function PricingJsonLd() {
  const origin = envClient.APP_URL.replace(/\/$/, "");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(pricingSoftwareJsonLd(`${origin}/pricing`)),
      }}
    />
  );
}

const ROWS: Array<{ label: string; free: string; pro: string }> = [
  {
    label: "Static QR codes (link, WiFi, vCard, text)",
    free: "Unlimited",
    pro: "Unlimited",
  },
  {
    label: "Short links + dynamic QR codes (shared limit)",
    free: "3 total",
    pro: "500 total",
  },
  { label: "Editable destinations", free: "✓", pro: "✓" },
  { label: "Scans, clicks & redirects", free: "Unlimited", pro: "Unlimited" },
  {
    label: "Redirects if you cancel or lapse",
    free: "Keep working",
    pro: "Keep working",
  },
  {
    label: "Scan & click analytics history",
    free: "30 days",
    pro: "Everything, forever",
  },
  { label: "PNG download (2048px)", free: "✓", pro: "✓" },
  { label: "Vector SVG download (dynamic codes)", free: "No", pro: "✓" },
  { label: "CSV export", free: "No", pro: "✓" },
];

const NOTES = [
  {
    q: "Are short links included?",
    a: "Yes. Create compact scst.one links with editable destinations and click analytics. Short links and dynamic QR codes share your plan's limit: 3 total on Free, 500 on Pro. A free account is required to create links; opening them is free for everyone.",
  },
  {
    q: "Why is the free plan actually free?",
    a: "Static codes cost us nothing to serve, because the content is inside the pattern. Dynamic redirects cost fractions of a cent. We'd rather earn upgrades from people who need scale and analytics than trap anyone's printed menus.",
  },
  {
    q: "How does billing work?",
    a: "Payments by Stripe, cancel self-serve anytime, invoices in your billing portal. Cancelling ends the Pro extras at period end. Your codes and redirects are untouched.",
  },
  {
    q: "What happens to my codes if I stop paying?",
    a: "They keep redirecting. You lose the Pro extras (full analytics history, vector downloads, CSV export) but every printed code keeps working.",
  },
  {
    q: "Is it really USD?",
    a: "Yes. Pro is $9 USD a month or $79 USD a year. Your bank converts it if you pay in another currency.",
  },
];

export default function PricingPage() {
  return (
    <main id="main">
      <PricingJsonLd />
      <DarkHero glow="75% 40%">
        <Container className="grid items-center gap-10 pb-36 pt-16 sm:pt-24 lg:grid-cols-[1.2fr_0.8fr] lg:pb-44">
          <div>
            <Eyebrow tone="verdigris" className="rise !text-verdigris-bright">Two plans. One promise.</Eyebrow>
            <h1 className="display mt-6 text-[clamp(4rem,11vw,10rem)] leading-[0.9] tracking-[-0.035em]">
              <SplitWords text="Pricing" start={60} />
            </h1>
            <p className="rise mt-7 max-w-2xl text-lead text-paper/70 [animation-delay:350ms]">
              Two plans, no fine print. And one promise that applies to both:{" "}
              <strong className="font-semibold text-paper">
                a Scanstone redirect never stops working
              </strong>
              . Not when you downgrade, not when you cancel, not when a limit is
              reached.
            </p>
          </div>
          <PromiseSeal className="mx-auto w-[min(70vw,360px)] text-verdigris-bright" />
        </Container>
      </DarkHero>
      <section className="relative">
        <Container className="relative -mt-28 max-w-5xl pb-20">
          <PlanCards headingLevel={2} />
          <ul className="mt-5 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-3">
            {[
              ["You cancel Pro", "Every code keeps redirecting"],
              ["You hit 3 codes on Free", "Scans keep working, you just can't add a 4th"],
              ["You forget we exist", "Codes don't expire from inactivity"],
            ].map(([a, b]) => (
              <li key={a} className="flex items-start gap-3 bg-paper p-5 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-verdigris" aria-hidden="true" />
                <span>
                  <span className="block font-medium text-ink">{a}</span>
                  <span className="text-ink-soft">{b}</span>
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <VelocityBand lines={["Redirects never expire", "Paid or not"]} />

      <section aria-labelledby="compare-h" data-nav="dark" className="night-portal relative overflow-hidden bg-night py-24 text-paper sm:py-32">
        <div className="aurora pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="gridlines-night pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <Container className="relative max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-bright">Fig. 01 / Side by side</p>
          <h2 id="compare-h" className="display mt-6 text-h2">
            <SplitWords text="What you get" />
          </h2>
          <CompareTable rows={ROWS} />
        </Container>
      </section>

      <section aria-labelledby="billing-h" className="py-24">
        <Container className="grid max-w-5xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Fig n="02">The details</Fig>
            <h2 id="billing-h" className="display mt-6 text-h2">Billing, plainly</h2>
            <p className="mt-5 text-ink-soft">
              Read the full promise in{" "}
              <Link href="/terms#covenant" className="text-verdigris-deep underline underline-offset-2">
                our terms
              </Link>
              .
            </p>
          </div>
          <Faq items={NOTES} />
        </Container>
      </section>

      <CtaBand
        title="Start with three codes. Keep them forever."
        body="No card, no trial clock. Upgrade when you need more."
        primary={{ href: "/signup", label: "Start free" }}
        secondary={{ href: "/demo", label: "See the live demo" }}
      />
    </main>
  );
}
