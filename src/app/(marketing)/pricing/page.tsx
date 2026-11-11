import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Card, Badge } from "@/components/ui";
import { PRICING, pricingSoftwareJsonLd } from "@/lib/plans";
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
  { label: "Vector SVG download (dynamic codes)", free: "—", pro: "✓" },
  { label: "CSV export", free: "—", pro: "✓" },
];

export default function PricingPage() {
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <PricingJsonLd />
      <div className="max-w-2xl">
        <h1 className="engraved text-4xl font-semibold">Pricing</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Two plans, no fine print. And one promise that applies to both:{" "}
          <strong>a Scanstone redirect never stops working</strong> — not when
          you downgrade, not when you cancel, not when a limit is reached.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card className="p-7">
          <h2 className="engraved text-xl font-semibold">Free</h2>
          <p className="mt-1 text-4xl font-semibold">$0</p>
          <p className="mt-1 text-sm text-ink-faint">forever</p>
          <ButtonLink href="/signup" variant="ghost" className="mt-5 w-full">
            Start free
          </ButtonLink>
        </Card>
        <Card className="border-verdigris/50 p-7 ring-1 ring-verdigris/30">
          <div className="flex items-center justify-between">
            <h2 className="engraved text-xl font-semibold">Pro</h2>
            <Badge tone="green">Most popular</Badge>
          </div>
          <p className="mt-1 text-4xl font-semibold">
            $9
            <span className="text-base font-normal text-ink-faint">
              {" "}USD/month
            </span>
          </p>
          <p className="mt-1 text-sm text-ink-faint">
            or {PRICING.yearly.label} ({PRICING.yearly.note})
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            If you cancel, printed codes and short links keep working — you only
            lose the Pro extras. That promise is in{" "}
            <Link href="/terms" className="text-verdigris-deep underline">
              our terms
            </Link>
            .
          </p>
          <ButtonLink href="/signup" variant="accent" className="mt-5 w-full">
            Go Pro
          </ButtonLink>
        </Card>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-130 border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink text-left">
              <th className="py-3 pr-4 font-medium">What you get</th>
              <th className="w-32 py-3 pr-4 font-medium">Free</th>
              <th className="w-40 py-3 font-medium">Pro</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-line">
                <td className="py-3 pr-4 text-ink-soft">{row.label}</td>
                <td className="py-3 pr-4">{row.free}</td>
                <td className="py-3 font-medium">{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 space-y-4 text-sm leading-relaxed text-ink-soft">
        <p>
          <strong>Short links are included.</strong> Create compact scst.one
          links with editable destinations and click analytics. Short links and
          dynamic QR codes share your plan&apos;s limit: 3 total on Free, 500 on
          Pro. A free account is required to create links; opening them is free
          for everyone.
        </p>
        <p>
          <strong>Why is the free plan actually free?</strong> Static codes cost
          us nothing to serve — the content is inside the pattern. Dynamic
          redirects cost fractions of a cent. We&apos;d rather earn upgrades
          from people who need scale and analytics than trap anyone&apos;s
          printed menus.
        </p>
        <p>
          <strong>Billing details:</strong> payments by Stripe, cancel
          self-serve anytime, invoices in your billing portal. Cancelling ends
          the Pro extras at period end — your codes and redirects are untouched.
        </p>
      </div>
    </main>
  );
}
