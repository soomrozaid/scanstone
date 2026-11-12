import type { Metadata } from "next";
import Link from "next/link";
import { pricingSoftwareJsonLd } from "@/lib/plans";
import { Container, Eyebrow, Fig } from "@/components/site/primitives";
import { PlanCards } from "@/components/site/PlanCards";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/site/Reveal";
import { envClient } from "@/config/env.client";

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
      <section className="relative overflow-hidden">
        <div
          className="gridlines absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]"
          aria-hidden="true"
        />
        <Container className="relative max-w-5xl pb-16 pt-14 text-center sm:pt-24">
          <Eyebrow tone="verdigris" className="rise">Two plans. One promise.</Eyebrow>
          <h1 className="display rise mt-6 text-display">Pricing</h1>
          <p className="rise mx-auto mt-7 max-w-2xl text-lead text-ink-soft">
            Two plans, no fine print. And one promise that applies to both:{" "}
            <strong className="font-semibold text-ink">
              a Scanstone redirect never stops working
            </strong>
            . Not when you downgrade, not when you cancel, not when a limit is
            reached.
          </p>
        </Container>
        <Container className="relative max-w-5xl pb-20">
          <PlanCards headingLevel={2} />
        </Container>
      </section>

      <section aria-labelledby="compare-h" className="border-t border-line bg-paper-deep/40 py-24">
        <Container className="max-w-5xl">
          <Reveal>
            <Fig n="01">Side by side</Fig>
            <h2 id="compare-h" className="display mt-6 text-h2">What you get</h2>
          </Reveal>
          <div className="mt-12 overflow-x-auto rounded-[24px] border border-line bg-white/60">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr className="text-left">
                  <th scope="col" className="px-6 py-5 font-medium text-ink-faint">Feature</th>
                  <th scope="col" className="w-36 px-6 py-5 font-medium">Free</th>
                  <th scope="col" className="w-44 bg-night px-6 py-5 font-medium text-paper">Pro</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const covenant = row.label.startsWith("Redirects if");
                  return (
                    <tr key={row.label} className={`border-t border-line ${covenant ? "bg-verdigris/[0.07]" : ""}`}>
                      <th scope="row" className="px-6 py-4 text-left font-normal text-ink-soft">
                        {row.label}
                        {covenant ? (
                          <span className="eyebrow ml-2 text-verdigris">The covenant</span>
                        ) : null}
                      </th>
                      <td className="px-6 py-4">{row.free}</td>
                      <td className="bg-night/[0.03] px-6 py-4 font-medium">{row.pro}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section aria-labelledby="billing-h" className="py-24">
        <Container className="grid max-w-5xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Fig n="02">The details</Fig>
            <h2 id="billing-h" className="display mt-6 text-h2">Billing, plainly</h2>
            <p className="mt-5 text-ink-soft">
              Read the full promise in{" "}
              <Link href="/terms" className="text-verdigris-deep underline underline-offset-2">
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
