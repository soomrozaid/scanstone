"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";

export type HelpTopic = { q: string; a: string; href: string };

export function HelpSearch({ topics }: { topics: HelpTopic[] }) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return topics;
    return topics.filter(
      (t) => t.q.toLowerCase().includes(q) || t.a.toLowerCase().includes(q),
    );
  }, [q, topics]);

  return (
    <div className="rounded-[22px] border border-line bg-paper p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8">
      <div>
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          Search help
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Expire, pricing, short link…"
          autoComplete="off"
          spellCheck={false}
          className="mt-1.5 min-h-11 w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-verdigris"
        />
      </div>
      {results.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft" role="status">
          Nothing matches that. Try another word, or email{" "}
          <a href="mailto:hello@scanstone.ca" className="underline underline-offset-4">
            hello@scanstone.ca
          </a>
          .
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {results.map((t, i) => (
            <li key={t.q}>
              <details className="group py-1" open={!q && i === 0}>
                <summary className="cursor-pointer list-none py-4 text-left text-lg font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {t.q}
                </summary>
                <p className="max-w-2xl pb-4 leading-relaxed text-ink-soft">{t.a}</p>
                <p className="pb-5">
                  <Link
                    href={t.href}
                    className="text-sm font-medium text-verdigris-deep underline underline-offset-4"
                  >
                    {t.href.startsWith("mailto:")
                      ? "Email us"
                      : "Open the full answer"}
                  </Link>
                </p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
