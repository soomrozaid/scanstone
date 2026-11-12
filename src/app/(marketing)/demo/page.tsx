import type { Metadata } from "next";
import { DarkHero } from "@/components/cinema/DarkHero";
import { SplitWords } from "@/components/cinema/SplitWords";
import { CountUp } from "@/components/cinema/CountUp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  bucketByDay,
  breakdown,
  countryName,
  type ScanRow,
} from "@/lib/analytics";
import { designSchema } from "@/lib/validate";
import { renderQRSvg } from "@/lib/qr/svg";
import { getShortUrl } from "@/lib/short-url";
import Link from "next/link";
import { Container, Eyebrow, Fig } from "@/components/site/primitives";
import { CtaBand } from "@/components/site/CtaBand";
import { ScanChart } from "@/components/analytics/ScanChart";
import { BreakdownList } from "@/components/analytics/BreakdownList";

export const metadata: Metadata = {
  title: "Live demo — a real dynamic QR code and its analytics",
  description:
    "A real Scanstone dynamic QR code with live scan analytics. Scan it yourself and watch the dashboard move.",
  alternates: { canonical: "/demo" },
};

export const revalidate = 60;

/** Public, read-only view of the seeded demo code. Slug is fixed server-side. */
const DEMO_SLUG = "cafemenu";

function DemoWarmingUp() {
  return (
    <main id="main">
      <DarkHero glow="50% 20%">
        <Container className="max-w-3xl pb-32 pt-20 text-center sm:pb-40 sm:pt-28">
          <Eyebrow tone="verdigris" className="rise !text-verdigris-bright">Live demo</Eyebrow>
          <h1 className="display mt-6 text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] tracking-[-0.03em]">
            <SplitWords text="Demo warming up" start={60} />
          </h1>
          <p className="rise mx-auto mt-6 max-w-xl text-lead text-paper/70 [animation-delay:300ms]">
            The demo code is being prepared. Meanwhile, the free generator
            works right now.
          </p>
          <Link
            data-magnetic
            href="/qr-code-generator"
            className="rise mt-10 inline-flex rounded-full bg-verdigris-bright px-8 py-4 font-medium text-night transition-colors hover:bg-paper [animation-delay:400ms]"
          >
            Open the free generator
          </Link>
        </Container>
      </DarkHero>
    </main>
  );
}

export default async function DemoPage() {
  // Preview builds may not have database credentials. Show the existing
  // fallback instead of failing static generation.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    return <DemoWarmingUp />;
  }

  const admin = createSupabaseAdminClient();
  const { data: code } = await admin
    .from("qr_codes")
    .select("id, slug, name, destination_url, design, scan_count")
    .eq("slug", DEMO_SLUG)
    .single();

  if (!code) {
    return <DemoWarmingUp />;
  }

  const { data: scans } = await admin
    .from("scans")
    .select("scanned_at, country, device, os, referer")
    .eq("code_id", code.id)
    .order("scanned_at", { ascending: false })
    .limit(5000);

  const rows: ScanRow[] = (scans ?? []) as ScanRow[];
  const series = bucketByDay(rows, 30);
  const design = designSchema.parse(code.design ?? {});
  const shortUrl = getShortUrl(code.slug);
  const svg = renderQRSvg(shortUrl, design);
  const countries = breakdown(rows, "country").map((b) => ({
    ...b,
    label: countryName(b.label),
  }));

  const last30 = series.days.reduce((n, d) => n + d.count, 0);
  const host = new URL(code.destination_url).hostname;

  return (
    <main id="main">
      <DarkHero glow="30% 20%">
        <Container className="relative pb-40 pt-16 sm:pt-24">
          <p className="eyebrow rise inline-flex items-center gap-2 text-copper-bright">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-copper opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-copper" />
            </span>
            Live demo · public
          </p>
          <h1 className="display mt-6 max-w-5xl text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] tracking-[-0.03em]">
            <SplitWords text="This is a real code." start={60} />{" "}
            <SplitWords text="Scan it." start={380} wordClass="italic text-verdigris-bright" />
          </h1>
          <p className="rise mt-6 max-w-2xl text-lead text-paper/70 [animation-delay:500ms]">
            Below is an actual dynamic code from a Scanstone account, with its
            actual analytics. Scan it with your phone and refresh, and your
            scan shows up in the counts. Older history was seeded so the charts
            aren&apos;t empty; new scans are real.
          </p>
        </Container>
      </DarkHero>
      <section className="relative">
        <Container className="relative -mt-28 grid gap-5 pb-24 lg:grid-cols-[380px_1fr]">
          <div className="h-fit rounded-[28px] bg-night-raised p-6 text-paper shadow-[var(--shadow-lift)] ring-1 ring-white/10 lg:sticky lg:top-24">
            <div className="radar relative rounded-2xl bg-white p-4">
              <div
                className="overflow-hidden [&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
            <p className="mt-5 break-all text-center font-mono text-sm text-paper/80">
              {shortUrl}
            </p>
            <div className="mt-5 rounded-2xl border border-night-line p-4 text-sm">
              <p className="eyebrow text-paper/45">Currently pointing at</p>
              <p className="mt-2 font-mono text-verdigris-bright">{host}</p>
            </div>
            <p className="mt-4 hidden text-center text-xs text-paper/45 lg:block">
              Point your phone camera at the code.
            </p>
            <a
              href={shortUrl}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-verdigris px-5 py-3 text-sm font-medium text-paper lg:hidden"
            >
              On your phone? Open the code&apos;s link
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="rounded-[28px] border border-line bg-paper p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Fig n="01">Dashboard view</Fig>
                <h2 className="display mt-4 text-3xl">{code.name}</h2>
              </div>
              <dl className="flex gap-6 text-right">
                <div>
                  <dt className="eyebrow text-ink-faint">Last 30 days</dt>
                  <dd className="display mt-1 text-3xl"><CountUp value={Number(last30) || 0} /></dd>
                </div>
                <div>
                  <dt className="eyebrow text-ink-faint">Scans all-time</dt>
                  <dd className="display mt-1 text-3xl"><CountUp value={Number(code.scan_count) || 0} /></dd>
                </div>
              </dl>
            </div>
            <div className="mt-8">
              <ScanChart series={series} title="Last 30 days" />
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <BreakdownList title="Countries" items={countries} />
              <BreakdownList title="Devices" items={breakdown(rows, "device")} />
              <BreakdownList title="Operating systems" items={breakdown(rows, "os")} />
            </div>
            <p className="mt-6 text-xs text-ink-faint">
              All-time and breakdowns include the seeded history. Country,
              device and OS only. No cookies, no stored IPs.
            </p>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Your own dashboard looks exactly like this."
        body="Three dynamic codes free, no card required, and the covenant applies from day one."
        primary={{ href: "/signup", label: "Make one like it" }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </main>
  );
}
