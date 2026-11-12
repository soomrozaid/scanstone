import Link from "next/link";
import { Wordmark } from "@/components/marketing/Wordmark";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div
        className="gridlines absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative">
        <Link href="/" aria-label="Scanstone home" className="inline-block">
          <Wordmark />
        </Link>
        <p
          aria-hidden="true"
          className="display mt-10 text-[clamp(7rem,4rem+14vw,15rem)] leading-none text-ink/10"
        >
          404
        </p>
        <h1 className="display -mt-6 text-h2">Nothing carved here</h1>
        <p className="mx-auto mt-5 max-w-md text-ink-soft">
          This page doesn&apos;t exist. If you scanned a printed code and landed
          here, the code&apos;s owner may have deleted it.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition hover:bg-verdigris-deep"
          >
            Back to Scanstone
          </Link>
          <Link
            href="/qr-code-generator"
            className="rounded-full border border-line px-6 py-3 font-medium text-ink transition hover:border-ink-faint"
          >
            Free QR generator
          </Link>
        </div>
      </div>
    </main>
  );
}
