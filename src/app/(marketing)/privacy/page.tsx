import type { Metadata } from "next";
import { LegalShell } from "@/components/cinema/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Scanstone handles your data, and the data of people who scan your codes.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" effective="Effective November 18, 2026" ghost="Privacy" lead="What we keep, what we never collect, and who can see it.">
      <div className="prose-scanstone space-y-6 text-[15px] leading-relaxed text-ink-soft">
        <section>
          <h2 className="display text-2xl text-ink">The short version</h2>
          <p className="mt-2">
            We store what we need to run your account and count scans of your
            codes, nothing more. We don&apos;t sell data, we don&apos;t run ad
            trackers, and we deliberately avoid collecting anything about the
            people who scan your codes beyond anonymous, aggregate-friendly
            fields.
          </p>
        </section>

        <section>
          <h2 className="display text-2xl text-ink">
            Data we hold about you (account holders)
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              Email address and a hashed password (or magic-link login) via
              Supabase Auth.
            </li>
            <li>
              The QR codes you create: name, destination URL, design settings.
            </li>
            <li>
              Plan and billing status. Card details are held by Stripe, never by
              us.
            </li>
            <li>
              Standard server logs (kept briefly for security and debugging).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="display text-2xl text-ink">
            Data recorded when someone scans a code
          </h2>
          <p className="mt-2">For each scan of a dynamic code we record:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Timestamp</li>
            <li>
              Country and region (derived from the network by our host; the IP
              itself is not stored)
            </li>
            <li>
              Coarse device class (mobile / tablet / desktop) and operating
              system family
            </li>
            <li>Referring page, when the browser sends one</li>
          </ul>
          <p className="mt-2">
            We do not store IP addresses in scan records, set cookies on
            scanners, or fingerprint devices. Scanners are never identified
            individuals to us.
          </p>
        </section>

        <section>
          <h2 className="display text-2xl text-ink">
            Free generator tools
          </h2>
          <p className="mt-2">
            Static QR codes (link, text, WiFi, vCard) are generated entirely in
            your browser. The content you type, including WiFi passwords,
            never reaches our servers.
          </p>
        </section>

        <section>
          <h2 className="display text-2xl text-ink">
            When you generate a QR code or short link
          </h2>
          <p className="mt-2">
            To understand how the tools are used, we store an anonymous
            generation event each time you complete a static code, download
            one, or create a dynamic code or short link. The event includes a
            random browser identifier that we create on first visit and keep
            in your browser (localStorage and a first-party <code>ss_aid</code> cookie)
            so we can tell repeat use on the same browser from a new one. It
            also includes whether the code was static or dynamic, the kind of
            action (generate or download), the time, the page path, and
            request-derived context computed on our server: country and region
            (and city when our host sends it), the browser name, a coarse
            device class, the operating system family, language, and a
            truncated copy of the User-Agent and Accept-Language headers. We
            do not use your IP address as the identifier, and we do not store
            IP addresses in this table. No account is required. We do not
            store the contents of a static code in these events.
          </p>
        </section>

        <section>
          <h2 className="display text-2xl text-ink">
            Processors we rely on
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Supabase: database and authentication (US region)</li>
            <li>Stripe: payments and invoices</li>
            <li>
              Vercel: hosting and privacy-friendly, cookieless site analytics
            </li>
          </ul>
        </section>

        <section>
          <h2 className="display text-2xl text-ink">Your controls</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              Export everything (codes + scan data) from your account page, any
              time.
            </li>
            <li>
              Delete your account from the account page. Codes, scan history,
              and login are removed immediately and permanently.
            </li>
            <li>Cancel billing self-serve via the billing portal.</li>
          </ul>
        </section>

        <section>
          <h2 className="display text-2xl text-ink">Contact</h2>
          <p className="mt-2">
            Privacy questions: email{" "}
            <a
              href="mailto:hello@scanstone.ca"
              className="text-verdigris-deep underline"
            >
              hello@scanstone.ca
            </a>
            . We&apos;ll answer plainly.
          </p>
        </section>
      </div>
    </LegalShell>
  );
}
