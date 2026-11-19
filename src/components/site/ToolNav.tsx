"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FREE_TOOLS } from "@/lib/free-tools";

function Chips({ type }: { type: string | null }) {
  const path = usePathname();
  return (
    <nav aria-label="Free tools" className="rise mt-8 flex flex-wrap gap-2 [animation-delay:500ms]">
      {FREE_TOOLS.map((t) => {
        const [tPath, tQuery] = t.href.split("?");
        const tType = tQuery ? new URLSearchParams(tQuery).get("type") : null;
        const on =
          tPath === path &&
          (tPath !== "/qr-code-generator" || (tType ?? "url") === (type ?? "url"));
        return (
          <Link
            key={t.href}
            href={t.href}
            scroll={tPath !== path}
            aria-current={on ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition ${on ? "border-paper bg-paper text-ink" : "border-white/15 bg-white/5 text-paper hover:border-white/40 hover:text-paper"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ChipsWithQuery() {
  const params = useSearchParams();
  return <Chips type={params.get("type")} />;
}

/** Row of links to every free tool, shown in the hero of each tool page. */
export function ToolNav() {
  return (
    <Suspense fallback={<Chips type={null} />}>
      <ChipsWithQuery />
    </Suspense>
  );
}
