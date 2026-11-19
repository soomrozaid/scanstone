import type { Metadata } from "next";
import Link from "next/link";
import { StaticGenerator, type GeneratorMode } from "@/components/free-tool/StaticGenerator";

export const metadata: Metadata = {
  title: "New static QR code",
  robots: { index: false },
};

const MODES: GeneratorMode[] = ["url", "wifi", "vcard", "text", "email", "sms", "phone"];

export default async function NewStaticCodePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialMode = MODES.find((m) => m === type) ?? "url";
  return (
    <div>
      <p className="text-sm text-ink-soft">
        <Link href="/dashboard" className="hover:text-ink">
          ← Your codes &amp; links
        </Link>
      </p>
      <h1 className="engraved mt-3 text-3xl font-semibold">New static QR code</h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
        A static code stores the link, WiFi login or contact card inside the
        code itself, so it never expires and doesn&apos;t count toward your
        dynamic codes. It can&apos;t be edited after you print it, and it
        isn&apos;t saved here, so keep the file you download.
      </p>
      <div className="mt-8">
        <StaticGenerator initialMode={initialMode} variant="dashboard" />
      </div>
    </div>
  );
}
