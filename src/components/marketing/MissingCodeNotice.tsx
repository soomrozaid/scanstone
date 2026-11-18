import Link from "next/link";

/**
 * Shown on the home page when /r/[slug] could not find a code and sent the
 * scanner to /?missing-code=1. Without it, someone who scanned a printed code
 * landed on a sales page with no idea what went wrong.
 */
export function MissingCodeNotice() {
  return (
    <section
      role="status"
      data-testid="missing-code-notice"
      className="mx-auto max-w-xl px-4 pt-6 sm:px-6"
    >
      <div className="rounded-md border border-copper/50 bg-paper-deep p-4 text-sm leading-relaxed text-ink-soft sm:p-5">
        <p className="text-base font-semibold text-ink">
          That QR code or short link isn&apos;t active
        </p>
        <p className="mt-1.5">
          The code you scanned or the scst.one link you opened doesn&apos;t
          exist on Scanstone. Its owner may have deleted it, or the address was
          typed wrong. Scanstone never switches a code off because someone
          stopped paying or reached a plan limit.
        </p>
        <p className="mt-1.5">
          If you found it on a menu, sign or flyer, let the business know so
          they can fix it.{" "}
          <Link
            href="/blog/qr-code-stopped-working-how-to-fix"
            className="font-medium text-verdigris-deep underline"
          >
            Why QR codes stop working
          </Link>
        </p>
      </div>
    </section>
  );
}
