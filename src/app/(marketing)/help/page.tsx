import type { Metadata } from "next";
import Link from "next/link";
import { DarkHero } from "@/components/cinema/DarkHero";
import { Container } from "@/components/site/primitives";
import { CtaBand } from "@/components/site/CtaBand";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { HelpSearch } from "@/components/site/HelpSearch";

export const metadata: Metadata = {
  title: "Help and FAQ",
  description:
    "Find answers about Scanstone QR codes and short links: whether codes expire, how to make one, pricing, and how to get in touch.",
  alternates: { canonical: "/help" },
};

const TOPICS = [
  {
    q: "Do Scanstone QR codes expire?",
    a: "Static codes never expire, because the link lives in the pattern itself. Dynamic codes and short links keep redirecting even if you cancel, downgrade, or hit a plan limit. They only stop if you delete the code or your account, or if the destination website itself goes down.",
    href: "/#faq",
  },
  {
    q: "How do I make a QR code?",
    a: "Paste a link at the top of the homepage. The code appears as you type. You can download a PNG or SVG with no account. To change the destination after you print it, save it as an editable code with a free account.",
    href: "/#qr",
  },
  {
    q: "How do I make a short link?",
    a: "Use the Short link tab on the homepage. A scst.one link can be edited later, so it needs a free account so we can store the redirect. You get 3 free codes or short links, and no credit card.",
    href: "/#short-link",
  },
  {
    q: "What does Pro cost, and does it renew by itself?",
    a: "Pro is $9 USD a month or $79 USD a year. It renews automatically until you cancel from the billing portal. Cancelling never turns off existing redirects.",
    href: "/pricing",
  },
  {
    q: "A QR code I already printed stopped working. What now?",
    a: "Scan it and look at the link before you tap it. If it is a generator's own address, they may have switched the redirect off. We wrote a short guide that matches what you see to the likely cause.",
    href: "/blog/qr-code-stopped-working-how-to-fix",
  },
  {
    q: "How do I get in touch?",
    a: "Email hello@scanstone.ca. A person reads it.",
    href: "mailto:hello@scanstone.ca",
  },
];

export default function HelpPage() {
  return (
    <main id="main">
      <DarkHero glow="70% 30%">
        <Container className="pb-28 pt-16 sm:pt-24">
          <Breadcrumbs items={[{ label: "Help" }]} tone="night" />
          <h1 className="display mt-6 text-[clamp(3rem,8vw,7rem)] leading-[0.92] tracking-[-0.03em]">
            Help
          </h1>
          <p className="mt-5 max-w-xl text-lead text-paper/80">
            Short answers to the things people ask before they print a code.
            For anything else, write to{" "}
            <a
              href="mailto:hello@scanstone.ca"
              className="text-verdigris-bright underline underline-offset-4"
            >
              hello@scanstone.ca
            </a>
            .
          </p>
        </Container>
      </DarkHero>
      <Container className="relative -mt-16 pb-24">
        <HelpSearch topics={TOPICS} />
        <p className="mt-10 text-sm text-ink-soft">
          You can also browse the{" "}
          <Link href="/blog" className="text-verdigris-deep underline underline-offset-4">
            blog
          </Link>{" "}
          or read the{" "}
          <Link href="/terms#covenant" className="text-verdigris-deep underline underline-offset-4">
            redirect promise in our terms
          </Link>
          .
        </p>
      </Container>
      <CtaBand
        title="Ready to make a code?"
        body="The homepage tool is free to try. Static codes need no account."
        primary={{ href: "/#qr", label: "Create a QR code" }}
        secondary={{ href: "/#short-link", label: "Create a short link" }}
      />
    </main>
  );
}
