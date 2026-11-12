import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/site/ToolPage";
import { StaticGenerator } from "@/components/free-tool/StaticGenerator";

export const metadata: Metadata = {
  title: "Free vCard QR Code Generator — Scan to Save Your Contact",
  description:
    "Create a free contact (vCard) QR code for business cards, email signatures, and booths. One scan saves your name, phone, email, and company. No expiration, PNG & SVG.",
  alternates: { canonical: "/vcard-qr-code-generator" },
};

const FAQS = [
  {
    q: "What does a vCard QR code do?",
    a: "It encodes a standard vCard (VERSION 3.0) with your name, company, phone, email, and website. When someone scans it, their phone offers to save you as a contact — every field filled in, no typos.",
  },
  {
    q: "Does it work on iPhone and Android?",
    a: "Yes. Both camera apps recognize vCard codes natively and open the 'add contact' screen directly.",
  },
  {
    q: "Will the code expire?",
    a: "Never. Your details are embedded in the pattern itself. It keeps working as long as the print exists.",
  },
  {
    q: "What if my phone number changes?",
    a: "A static vCard code can't be edited after printing. If your details change often, a Scanstone dynamic code pointing at a personal page may serve you better — you can re-point it anytime, free.",
  },
];

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function VcardQRPage() {
  return (
    <>
      <JsonLd />
      <ToolPage
        current="/vcard-qr-code-generator"
        eyebrow="Free tool · contact cards"
        title="vCard QR code generator."
        accent="One scan, saved contact."
        lead={
          <>
            Put it on your business card, badge, booth banner, or email
            signature. One scan opens &ldquo;add contact&rdquo; with everything
            filled in. Free, no account, and it never expires.
          </>
        }
        tool={<StaticGenerator initialMode="vcard" />}
        faqs={FAQS}
        related={
          <>
                More free tools: the{" "}
                <Link href="/qr-code-generator" className="text-verdigris-deep underline">
                  QR code generator
                </Link>{" "}
                and the{" "}
                <Link href="/wifi-qr-code-generator" className="text-verdigris-deep underline">
                  WiFi QR generator
                </Link>
                .
              </>
        }
      />
    </>
  );
}
