import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Scanstone is a small, independent product built in Saskatchewan, Canada. Printed QR codes shouldn't stop working when a subscription lapses.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Scanstone" }],
  },
};

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="engraved text-3xl font-semibold">About</h1>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
        <p>
          Scanstone is a small, independent product built in Saskatchewan,
          Canada. We built it because printed QR codes shouldn&apos;t stop
          working when a subscription lapses.
        </p>
        <p>
          Questions, or just want to say hello? Write to{" "}
          <a
            href="mailto:hello@scanstone.ca"
            className="text-verdigris-deep underline"
          >
            hello@scanstone.ca
          </a>
          .
        </p>
      </div>
    </main>
  );
}
