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
import { Container, Fig } from "@/components/site/primitives";
import { CtaBand } from "@/components/site/CtaBand";
import { ScanChart } from "@/components/analytics/ScanChart";
import { BreakdownList } from "@/components/analytics/BreakdownList";
import { ChartGrow } from "@/components/cinema/ChartGrow";

export const metadata: Metadata = {
  title: "Live demo — a real dynamic QR code and its analytics",
  description:
    "A real Scanstone dynamic QR code with live scan analytics. Scan it yourself and watch the dashboard move.",
  alternates: { canonical: "/demo" },
};

export const revalidate = 60;

/** Public, read-only view of the seeded demo code. Slug is fixed server-side. */
const DEMO_SLUG = "cafemenu";

/** Sample numbers for the offline view. Clearly labelled, never presented as real scans. */
const SAMPLE_SERIES = {
  days: [
    4, 6, 5, 8, 11, 9, 13, 10, 15, 12, 18, 16, 14, 21, 17, 23, 20, 27, 24, 22,
    29, 26, 33, 30, 28, 36, 32, 39, 35, 42,
  ].map((count, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400_000).toISOString().slice(0, 10),
    count,
  })),
  total: 654,
};

/**
 * Shown when the database isn't reachable (local builds, previews without
 * keys, or the demo code not seeded yet). Same dashboard, sample numbers,
 * and it says so plainly.
 */
function DemoWarmingUp() {
  const sampleSvg = renderQRSvg("https://www.scanstone.ca/qr-code-generator", { fg: "#161411", bg: "#ffffff", shape: "rounded" });
  return (
    <main id="main">
      <DarkHero glow="30% 20%">
        <Container className="relative pb-40 pt-16 sm:pt-24">
          <p className="eyebrow rise inline-flex items-center gap-2 text-paper/60">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-paper/40" />
            Live demo · offline, showing sample data
          </p>
          <h1 className="display mt-6 max-w-5xl text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] tracking-[-0.03em]">
            <SplitWords text="The live demo is resting." start={60} />{" "}
            <SplitWords text="Here's what it shows." start={420} wordClass="italic text-verdigris-bright" />
          </h1>
          <p className="rise mt-6 max-w-2xl text-lead text-paper/70 [animation-delay:500ms]">
            The public demo reads a real code&apos;s scans from our database,
            and that connection isn&apos;t available on this page right now.
            Below is the same dashboard filled with sample numbers. None of
            them are real scans.
          </p>
        </Container>
      </DarkHero>
      <section className="relative">
        <Container className="relative -mt-28 grid gap-5 pb-24 lg:grid-cols-[380px_1fr]">
          <div className="h-fit rounded-[28px] bg-night-raised p-6 text-paper shadow-[var(--shadow-lift)] ring-1 ring-white/10 lg:sticky lg:top-24">
            <div className="radar relative rounded-2xl bg-white p-4">
              <div
                role="img"
                aria-label="Sample QR code that opens the free Scanstone generator"
                className="overflow-hidden [&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: sampleSvg }}
              />
            </div>
            <p className="mt-5 text-center font-mono text-sm text-paper/80">Sample code</p>
            <div className="mt-5 rounded-2xl border border-night-line p-4 text-sm">
              <p className="eyebrow text-paper/60">A dynamic code could point at</p>
              <p className="relative mt-2 h-6 overflow-hidden font-mono text-verdigris-bright">
                {["yourcafe.ca/menu", "yourcafe.ca/brunch", "yourcafe.ca/events"].map((d, i) => (
                  <span key={d} className="sd-dest absolute inset-0" style={{ animationDelay: `${i * 2}s` }}>
                    {d}
                  </span>
                ))}
              </p>
            </div>
            <p className="mt-4 text-center text-xs text-paper/60">
              This one opens the free generator, so scanning it is safe.
            </p>
          </div>

          <div className="rounded-[28px] border border-line bg-paper p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Fig n="01">Dashboard view</Fig>
                <h2 className="display mt-4 text-3xl">Café menu, table tents</h2>
                <span className="mt-3 inline-flex rounded-full border border-copper/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-copper">
                  Sample data
                </span>
              </div>
              <dl className="flex gap-6 text-right">
                <div>
                  <dt className="eyebrow text-ink-faint">Last 30 days</dt>
                  <dd className="display mt-1 text-3xl"><CountUp value={SAMPLE_SERIES.total} /></dd>
                </div>
              </dl>
            </div>
            <ChartGrow>
              <div className="mt-8">
                <ScanChart series={SAMPLE_SERIES} title="Last 30 days (sample data)" />
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <BreakdownList
                  title="Countries"
                  items={[
                    { label: "Canada", count: 512, share: 0.78 },
                    { label: "United States", count: 98, share: 0.15 },
                    { label: "United Kingdom", count: 44, share: 0.07 },
                  ]}
                />
                <BreakdownList
                  title="Devices"
                  items={[
                    { label: "mobile", count: 598, share: 0.91 },
                    { label: "tablet", count: 35, share: 0.05 },
                    { label: "desktop", count: 21, share: 0.04 },
                  ]}
                />
                <BreakdownList
                  title="Operating systems"
                  items={[
                    { label: "iOS", count: 371, share: 0.57 },
                    { label: "Android", count: 247, share: 0.38 },
                    { label: "other", count: 36, share: 0.05 },
                  ]}
                />
              </div>
            </ChartGrow>
            <p className="mt-6 text-xs text-ink-faint">
              Sample numbers. A real dashboard shows country, device and OS
              only. No cookies, no stored IPs.
            </p>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Your own dashboard looks exactly like this."
        body="Three dynamic codes free, no card required, and the covenant applies from day one."
        primary={{ href: "/signup", label: "Make one like it" }}
        secondary={{ href: "/qr-code-generator", label: "Use the free generator" }}
      />
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
              <p className="eyebrow text-paper/60">Currently pointing at</p>
              <p className="mt-2 font-mono text-verdigris-bright">{host}</p>
            </div>
            <p className="mt-4 hidden text-center text-xs text-paper/60 lg:block">
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
