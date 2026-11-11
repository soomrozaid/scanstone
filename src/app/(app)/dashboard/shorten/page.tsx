import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { ShortUrlForm } from "@/components/dashboard/ShortUrlForm";

export const metadata: Metadata = {
  title: "New short URL",
  robots: { index: false },
};

export default function NewShortUrlPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard" className="text-sm text-ink-faint hover:text-ink">
        ← Codes &amp; links
      </Link>
      <h1 className="engraved mt-5 text-3xl font-semibold">New short URL</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Turn a long link into a short URL you can share anywhere. Track clicks
        and edit the destination while keeping the same link.
      </p>
      <Card className="mt-6 p-6">
        <ShortUrlForm />
      </Card>
      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        Short URLs and dynamic QR codes share your plan’s limit. Every short URL
        includes a QR code, and redirects keep working on any plan.
      </p>
    </div>
  );
}
