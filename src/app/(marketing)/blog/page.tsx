import type { Metadata } from "next";
import { DarkHero } from "@/components/cinema/DarkHero";
import { SplitWords } from "@/components/cinema/SplitWords";
import Link from "next/link";
import { docsIn } from "@/lib/content";
import { Container, Eyebrow } from "@/components/site/primitives";
import { Spotlight } from "@/components/site/Spotlight";
import { AssembleQR } from "@/components/cinema/AssembleQR";

export const metadata: Metadata = {
  title: "Blog — straight answers about QR codes",
  description:
    "Investigations and comparisons about QR codes: what expires, what doesn't, and how to never lose a printed code to a paywall. No fluff, no sales pitch.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndex() {
  const docs = docsIn("blog");
  const [first, ...rest] = docs;
  return (
    <main id="main">
      <DarkHero glow="50% 0%">
        <Container className="pb-40 pt-16 sm:pt-24">
          <header className="max-w-3xl">
            <Eyebrow tone="verdigris" className="rise !text-verdigris-bright">Straight answers about QR codes</Eyebrow>
            <h1 className="display mt-6 text-[clamp(4rem,12vw,11rem)] leading-[0.9] tracking-[-0.035em]">
              <SplitWords text="Blog" start={60} />
            </h1>
            <p className="rise mt-6 text-lead text-paper/70 [animation-delay:300ms]">
              Straight answers about QR codes: what expires, what doesn&apos;t,
              and how to keep your printed codes working without paying anyone
              forever.
            </p>
          </header>
        </Container>
      </DarkHero>
      <Container className="relative -mt-28 pb-24">

        {first ? (
          <Link
            href={`/blog/${first.slug}`}
            data-cursor="Read"
            className="group relative grid gap-8 overflow-hidden rounded-[28px] bg-night-raised p-8 text-paper shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition sm:p-12 lg:grid-cols-[1.4fr_0.6fr]"
          >
            <div>
              <p className="eyebrow text-paper/60">Latest · {first.category}</p>
              <h2 className="display mt-5 text-h2 transition-colors group-hover:text-verdigris-bright">
                {first.title}
              </h2>
              <p className="mt-5 max-w-2xl text-paper/70">{first.description}</p>
            </div>
            <div className="flex items-end justify-between gap-6 lg:flex-col lg:items-end">
              <div aria-hidden="true" className="blog-stone hidden w-44 rotate-[-5deg] rounded-[10px] bg-[#efe7d6] p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] transition-transform duration-700 ease-[var(--ease-settle)] group-hover:-translate-y-2 group-hover:rotate-[-1deg] sm:block">
                <p className="text-center font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">Scan to read</p>
                <AssembleQR lite data={`https://www.scanstone.ca/blog/${first.slug}`} label="" className="mt-2 !bg-transparent !p-0" />
              </div>
              <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                <time dateTime={first.date} className="font-mono text-sm text-paper/60">
                  {formatDate(first.date)}
                </time>
                <span aria-hidden="true" className="text-4xl transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        ) : null}

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {rest.map((doc) => (
            <li key={doc.slug}>
              <Spotlight className="rounded-[24px]" max={5}>
              <Link
                href={`/blog/${doc.slug}`}
                data-cursor="Read"
                className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-paper p-7 transition hover:border-ink-faint hover:shadow-[var(--shadow-card)]"
              >
                <div data-depth aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 w-28 rotate-[8deg] opacity-[0.16] transition duration-700 ease-[var(--ease-settle)] group-hover:right-4 group-hover:top-4 group-hover:rotate-0 group-hover:opacity-100">
                  <AssembleQR lite data={`https://www.scanstone.ca/blog/${doc.slug}`} label="" className="!rounded-[8px] !p-[8%] shadow-[0_18px_40px_-16px_rgba(22,20,17,0.45)]" />
                </div>
                <p className="eyebrow text-copper">{doc.category}</p>
                <h2 className="display mt-4 pr-24 text-2xl transition-colors group-hover:text-verdigris-deep">{doc.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{doc.description}</p>
                <p className="mt-6 font-mono text-xs text-ink-faint">
                  <time dateTime={doc.date}>{formatDate(doc.date)}</time>
                </p>
              </Link>
              </Spotlight>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
