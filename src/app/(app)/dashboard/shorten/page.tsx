import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { ShortUrlForm } from "@/components/dashboard/ShortUrlForm";
import { validateDestinationUrl } from "@/lib/validate";

export const metadata: Metadata = {
  title: "New short URL",
  robots: { index: false },
};

function prefillUrl(raw?: string) {
  if (!raw) return "";
  const dest = validateDestinationUrl(raw);
  return dest.ok ? dest.url : "";
}

export default async function NewShortUrlPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
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
        <ShortUrlForm initialUrl={prefillUrl(url)} />
      </Card>
      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        Short URLs and dynamic QR codes share your plan’s limit. Every short URL
        includes a QR code, and redirects keep working on any plan.
      </p>
    </div>
  );
}
