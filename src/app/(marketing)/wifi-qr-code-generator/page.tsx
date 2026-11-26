import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/site/ToolPage";
import { StaticGenerator } from "@/components/free-tool/StaticGenerator";

export const metadata: Metadata = {
  title: "WiFi QR Code Generator: Free, No Sign-Up, Never Expires",
  description:
    "Make a free WiFi QR code in your browser. Guests scan with their phone camera and join, no typing. No sign-up, no watermark, never expires. PNG and SVG.",
  alternates: { canonical: "/wifi-qr-code-generator" },
};

const FAQS = [
  {
    q: "How does a WiFi QR code work?",
    a: "The code embeds your network name and password in a standard format (WIFI:). iPhones and Android phones recognize it natively: point the camera, tap the prompt, and the device joins. No typing, no app.",
  },
  {
    q: "Is my WiFi password sent to your servers?",
    a: "No. This generator runs entirely in your browser. The password is encoded into the image on your device and never transmitted to us.",
  },
  {
    q: "Does a WiFi QR code expire?",
    a: "No. The network name and password are stored in the image itself, so there is nothing for us or anyone else to switch off. It keeps working until you change the network name or password.",
  },
  {
    q: "Does the code stop working if I change my password?",
    a: "Yes. The printed code holds the password it was made with, so after you change the password or rename the network, make a new code and replace the old prints. A WiFi code can't be edited after printing.",
  },
  {
    q: "Does it work on iPhone and Android?",
    a: "Yes. iPhones and recent Android phones read WiFi codes with the built-in camera and show a prompt to join. Some older Android phones need the QR mode in the camera app or Google Lens.",
  },
  {
    q: "Is it safe to put my WiFi code on a wall?",
    a: "Anyone who scans or photographs the code can read the password, the same as if you wrote it on the sign. For a café, office or rental, use a guest network so your main network stays private, and change its password when you want to cut access.",
  },
  {
    q: "Can I make a code for a network with no password?",
    a: "Yes. Leave the password empty or pick None (open network), and the code holds only the network name.",
  },
  {
    q: "Does it work for a hidden network?",
    a: "Yes. Tick Hidden network before you download. The code then tells the phone the network doesn't broadcast its name, so it can join even though the name isn't in the WiFi list.",
  },
  {
    q: "Is it really free? Is there a watermark?",
    a: "Free, with no account and no watermark. Download a PNG for screens and small prints, or an SVG for print shops and large signs.",
  },
  {
    q: "Where do people put these?",
    a: "Table tents and menus in cafés, guest-room welcome cards, waiting rooms, coworking desks, Airbnb binders. Anywhere guests ask 'what's the WiFi?'",
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

export default function WifiQRPage() {
  return (
    <>
      <JsonLd />
      <ToolPage
        current="/wifi-qr-code-generator"
        eyebrow="Free tool · private"
        title="WiFi QR code generator."
        accent="Free, private, permanent."
        lead={
          <>
            Stop spelling out your WiFi password. Guests scan, tap, and
            they&apos;re on. Generated entirely in your browser, so the password
            never touches our servers, and like every static code, it never
            expires.
          </>
        }
        tool={<StaticGenerator initialMode="wifi" />}
        faqs={FAQS}
        related={
          <>
                Also useful: the{" "}
                <Link href="/qr-code-generator" className="text-verdigris-deep underline">
                  general QR generator
                </Link>{" "}
                for links and text, or{" "}
                <Link href="/vcard-qr-code-generator" className="text-verdigris-deep underline">
                  contact-card codes
                </Link>{" "}
                for business cards.
              </>
        }
      />
    </>
  );
}
