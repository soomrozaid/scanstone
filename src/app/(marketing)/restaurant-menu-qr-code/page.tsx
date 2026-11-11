import type { Metadata } from "next";
import Link from "next/link";
import { HeroVisual } from "@/components/hero/Hero";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { Badge, Card } from "@/components/ui";
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
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <Badge tone="green">For restaurants & cafés</Badge>
          <h1 className="engraved mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl">
            Change the menu.
            <br />
            Keep the QR code.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
            A dynamic restaurant menu QR code lets you change the menu link
            after printing. Keep the same table cards, update the destination,
            and see how often guests scan.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <MarketingLink
              placement="restaurant_hero"
              action="signup"
              href="/signup"
              variant="accent"
              className="px-5 py-3"
            >
              Create a free menu code
            </MarketingLink>
            <MarketingLink
              placement="restaurant_hero"
              action="static_generator"
              href="/qr-code-generator"
              variant="ghost"
              className="px-5 py-3"
            >
              Use a static code
            </MarketingLink>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            3 editable codes or short links free. No credit card.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Bring your existing menu webpage or public PDF link. Scanstone does
            not host your menu.
          </p>
        </div>
        <HeroVisual />
      </section>
      <section className="border-y border-line bg-paper-deep/50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="engraved text-3xl font-semibold">
            From menu link to table card
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              [
                "01",
                "Link your menu",
                "Open your menu URL in a private browser window. It should load without asking guests to sign in. Use that URL as the destination for a new dynamic code.",
              ],
              [
                "02",
                "Test the printed version",
                "Download the PNG, print a sample at its intended size, and scan it on more than one phone. Keep a clear margin around the code and check it in your dining-room lighting.",
              ],
              [
                "03",
                "Update without reprinting",
                "When your menu moves to a new URL, edit the code’s destination in your dashboard. Use separate codes for tables and takeaway bags if you want to compare their scan counts.",
              ],
            ].map(([n, heading, body]) => (
              <li key={n}>
                <Card className="h-full p-6">
                  <span className="font-mono text-sm text-verdigris-deep">
                    {n}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{heading}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {body}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="engraved text-3xl font-semibold">
          Before you print the whole batch
        </h2>
        <ul className="mt-6 list-disc space-y-3 pl-5 text-ink-soft">
          <li>
            Use dark marks on a light background and leave the code’s clear
            border intact.
          </li>
          <li>
            Check the menu on a phone over mobile data, not only your staff
            WiFi.
          </li>
          <li>
            Put “Scan for our menu” beside it, plus a readable menu URL for
            guests who cannot scan.
          </li>
          <li>
            Keep a printed menu available and avoid placing codes across folds
            or reflective surfaces.
          </li>
        </ul>
        <p className="mt-6 text-sm text-ink-soft">
          Need a guest network code too? Use the{" "}
          <Link
            href="/wifi-qr-code-generator"
            className="text-verdigris-deep underline"
          >
            free WiFi QR generator
          </Link>
          .
        </p>
      </section>
      <section
        className="mx-auto max-w-3xl px-4 pb-16 sm:px-6"
        aria-labelledby="menu-faq"
      >
        <h2 id="menu-faq" className="engraved text-3xl font-semibold">
          Restaurant menu QR codes, explained
        </h2>
        <dl className="mt-8 space-y-6">
          {questions.map(({ q, a }) => (
            <div key={q} className="border-b border-line pb-6">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-2 leading-relaxed text-ink-soft">{a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-ink-soft">
          Start free, then upgrade if you need more codes, full scan history, or
          vector downloads.{" "}
          <Link href="/pricing" className="text-verdigris-deep underline">
            Compare plans
          </Link>{" "}
          or{" "}
          <Link href="/demo" className="text-verdigris-deep underline">
            explore the live demo
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
