import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/site/ToolPage";
import { StaticGenerator } from "@/components/free-tool/StaticGenerator";

export const metadata: Metadata = {
  title: {
    absolute: "Free Permanent QR Code Generator: Never Expires, No Sign-up",
  },
  description:
    "Make a permanent QR code that never expires, free. No sign-up, no trial, no watermark, no scan limit. Download PNG or vector SVG for print.",
  alternates: { canonical: "/qr-code-generator" },
};

const FAQS = [
  {
    q: "Is this a permanent QR code generator?",
    a: "Yes. Every code made on this page is static, which means your link or text is written into the pattern itself. Nothing passes through Scanstone when someone scans it, so there is no expiry date, no subscription and nothing we could turn off. It keeps working as long as the page or details it holds are still valid.",
  },
  {
    q: "Is this QR code generator really free?",
    a: "Yes. Static QR codes made here are free without an account, watermark, scan limit, or expiration, including for commercial use. The code contains your content directly, so there is nothing we could switch off later.",
  },
  {
    q: "Will my QR code expire?",
    a: "No. A static QR code encodes your link or text into the pattern itself. It works for as long as QR codes exist. If a generator's 'free' code stopped working after two weeks, you were given a trial of a dynamic code, which is a different product.",
  },
  {
    q: "What's the catch?",
    a: "None on static codes. We make money on dynamic codes, the ones whose destination you can edit after printing, with scan statistics. If you don't need that, use this page free, forever.",
  },
  {
    q: "PNG or SVG: which should I download?",
    a: "PNG (2048px) is fine for most uses up to poster size. SVG is a vector: infinitely sharp, preferred by print shops, and editable in Illustrator, Figma, or Inkscape. Both are free here.",
  },
  {
    q: "Can I change where the code points after printing?",
    a: "Not with a static code. The destination is carved into the pattern. If you need to re-point a printed code later, create a free Scanstone account and use a dynamic code instead: 3 are included free, and their redirects never expire either.",
  },
];

function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Scanstone Free QR Code Generator",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free permanent QR code generator: static codes that never expire, with no sign-up and no watermark. Download PNG or SVG.",
    },
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

export default function FreeQRGeneratorPage() {
  return (
    <>
      <JsonLd />
      <ToolPage
        current="/qr-code-generator"
        eyebrow="Free tool · no sign-up"
        title="Free permanent QR code generator."
        accent="It never expires."
        lead={
          <>
            Make a QR code for a link, WiFi network, contact card, text,
            email, SMS or phone number.
            Download it as PNG or vector SVG. No account, no watermark, no
            14-day surprise: static codes are permanent by design, because the
            content lives inside the pattern itself.
          </>
        }
        tool={<StaticGenerator initialMode="url" syncTypeParam />}
        faqs={FAQS}
        related={
          <>
                Need WiFi or contact codes specifically? Use the dedicated{" "}
                <Link href="/wifi-qr-code-generator" className="text-verdigris-deep underline">
                  WiFi QR generator
                </Link>{" "}
                or{" "}
                <Link href="/vcard-qr-code-generator" className="text-verdigris-deep underline">
                  vCard QR generator
                </Link>
                . Not sure which kind of code you need? Read{" "}
                <Link href="/blog/permanent-qr-code" className="text-verdigris-deep underline">
                  what makes a QR code permanent
                </Link>
                .
              </>
        }
      />
    </>
  );
}
