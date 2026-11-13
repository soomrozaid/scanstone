import Link from "next/link";
import { DarkHero } from "@/components/cinema/DarkHero";
import { SplitWords } from "@/components/cinema/SplitWords";
import { ReadProgress } from "@/components/cinema/ReadProgress";
import { ReadingDial } from "@/components/cinema/ReadingDial";
import { envClient } from "@/config/env.client";
import { Prose } from "./Prose";
import { readingMinutes, type DocMeta } from "@/lib/content";

const COLLECTION_LABEL: Record<DocMeta["collection"], string> = {
  blog: "Blog",
  guides: "Guides",
};

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Questions under a "## Common questions" heading: each "### Question" and the
 * plain paragraph after it. Only used for FAQPage JSON-LD, so the visible text
 * and the structured data always match.
 */
function faqFromMarkdown(body: string): { question: string; answer: string }[] {
  const start = body.search(/^## Common questions\s*$/m);
  if (start === -1) return [];
  const rest = body.slice(start).split("\n").slice(1);
  const out: { question: string; answer: string }[] = [];
  let q: string | null = null;
  let a: string[] = [];
  const flush = () => {
    if (q && a.length) out.push({ question: q, answer: a.join(" ").trim() });
    q = null;
    a = [];
  };
  for (const line of rest) {
    if (/^## /.test(line)) break;
    const h = line.match(/^### (.+)$/);
    if (h) {
      flush();
      q = (h[1] ?? "").trim();
    } else if (q && line.trim() && !line.startsWith("_")) {
      a.push(line.trim().replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
    }
  }
  flush();
  return out;
}

function JsonLd({ doc, body }: { doc: DocMeta; body: string }) {
  const base = envClient.APP_URL;
  const url = `${base}/${doc.collection}/${doc.slug}`;
  const collLabel = COLLECTION_LABEL[doc.collection];
  const data = [
    {
      "@context": "https://schema.org",
      "@type": doc.collection === "guides" ? "HowTo" : "Article",
      headline: doc.title,
      description: doc.description,
      datePublished: doc.date,
      dateModified: doc.updated ?? doc.date,
      wordCount: body.trim().split(/\s+/).filter(Boolean).length,
      author: { "@type": "Organization", name: "Scanstone", url: base },
      publisher: {
        "@type": "Organization",
        name: "Scanstone",
        url: base,
        logo: { "@type": "ImageObject", url: `${base}/icon` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: base },
        {
          "@type": "ListItem",
          position: 2,
          name: collLabel,
          item: `${base}/${doc.collection}`,
        },
        { "@type": "ListItem", position: 3, name: doc.title, item: url },
      ],
    },
  ];
  const faqs = faqFromMarkdown(body);
  if (faqs.length) {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    } as unknown as (typeof data)[number]);
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ArticlePage({ doc, body }: { doc: DocMeta; body: string }) {
  const minutes = readingMinutes(body);
  return (
    <main id="main">
      <JsonLd doc={doc} body={body} />
      <ReadProgress />
      <ReadingDial minutes={minutes} />
      <DarkHero glow="50% 0%">
        <div aria-hidden="true" className="pointer-events-none absolute right-[6%] top-1/2 hidden w-[220px] -translate-y-1/2 text-verdigris-bright/80 xl:block">
          <svg viewBox="0 0 200 200" className="seal-spin block w-full">
            <defs>
              <path id="read-ring" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
            </defs>
            <text className="fill-current font-mono text-[12px] tracking-[0.3em]">
              <textPath href="#read-ring">{`${minutes} MINUTE READ \u2022 ${doc.category.toUpperCase()} \u2022 ${minutes} MINUTE READ \u2022 `}</textPath>
            </text>
          </svg>
          <p className="display absolute inset-0 flex items-center justify-center text-7xl italic text-paper">{minutes}</p>
        </div>
        <div className="mx-auto max-w-4xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <nav aria-label="Breadcrumb" className="eyebrow rise text-paper/50">
            <Link href={`/${doc.collection}`} className="hover:text-paper">
              {COLLECTION_LABEL[doc.collection]}
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span className="text-verdigris-bright">{doc.category}</span>
          </nav>

          <header className="mt-6">
            <h1 className="display text-[clamp(2.4rem,5.6vw,4.8rem)] leading-[1] tracking-[-0.025em]">
              <SplitWords text={doc.title} start={40} step={45} />
            </h1>
            <p className="rise mt-6 max-w-3xl text-lead text-paper/70 [animation-delay:350ms]">
              {doc.description}
            </p>
            <p className="rise mt-6 font-mono text-xs text-paper/60 [animation-delay:450ms]">
              <time dateTime={doc.date}>{formatDate(doc.date)}</time>
              <span aria-hidden className="mx-2">
                ·
              </span>
              {minutes} min read
            </p>
          </header>
        </div>
      </DarkHero>
      <div className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
      <hr className="hairline mt-8 border-0" />

      <article data-article className="article-ink mt-8">
        <Prose>{body}</Prose>
      </article>

      <aside className="mt-16 rounded-[28px] bg-night p-8 text-paper sm:p-10">
        <p className="display text-3xl text-paper">
          Make a QR code that can&apos;t be switched off
        </p>
        <p className="mt-3 text-sm leading-relaxed text-paper/70">
          Static codes are free forever. No account, no expiration, because the
          content lives in the pattern itself. Dynamic codes come with a written
          covenant: the redirect never turns off, even if you stop paying.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/qr-code-generator"
            className="rounded-full bg-verdigris px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-verdigris-bright hover:text-night"
          >
            Free QR generator
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-paper/25 px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-paper/10"
          >
            See pricing
          </Link>
        </div>
      </aside>
      </div>
    </main>
  );
}
