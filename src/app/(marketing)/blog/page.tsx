import type { Metadata } from "next";
import Link from "next/link";
import { docsIn } from "@/lib/content";
import { Container, Eyebrow } from "@/components/site/primitives";

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
      <Container className="pb-24 pt-12 sm:pt-20">
        <header className="max-w-3xl">
          <Eyebrow tone="verdigris" className="rise">Straight answers about QR codes</Eyebrow>
          <h1 className="display rise mt-6 text-display">Blog</h1>
          <p className="rise mt-6 text-lead text-ink-soft">
            Straight answers about QR codes: what expires, what doesn&apos;t,
            and how to keep your printed codes working without paying anyone
            forever.
          </p>
        </header>

        {first ? (
          <Link
            href={`/blog/${first.slug}`}
            className="group mt-16 grid gap-8 overflow-hidden rounded-[28px] bg-night p-8 text-paper transition sm:p-12 lg:grid-cols-[1.4fr_0.6fr]"
          >
            <div>
              <p className="eyebrow text-paper/50">Latest · {first.category}</p>
              <h2 className="display mt-5 text-h2 transition-colors group-hover:text-verdigris-bright">
                {first.title}
              </h2>
              <p className="mt-5 max-w-2xl text-paper/70">{first.description}</p>
            </div>
            <div className="flex items-end justify-between gap-4 lg:flex-col lg:items-end">
              <time dateTime={first.date} className="font-mono text-sm text-paper/50">
                {formatDate(first.date)}
              </time>
              <span aria-hidden="true" className="text-4xl transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ) : null}

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {rest.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/blog/${doc.slug}`}
                className="group flex h-full flex-col rounded-[24px] border border-line bg-white/55 p-7 transition hover:-translate-y-0.5 hover:border-ink-faint hover:shadow-[var(--shadow-card)]"
              >
                <p className="eyebrow text-copper">{doc.category}</p>
                <h2 className="display mt-4 text-2xl transition-colors group-hover:text-verdigris-deep">{doc.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{doc.description}</p>
                <p className="mt-6 font-mono text-xs text-ink-faint">
                  <time dateTime={doc.date}>{formatDate(doc.date)}</time>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
