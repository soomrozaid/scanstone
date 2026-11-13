import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/marketing/Wordmark";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <div className="flex flex-col items-center justify-center px-5 py-12">
        <Link href="/" className="mb-10" aria-label="Scanstone home">
          <Wordmark />
        </Link>
        <div className="w-full max-w-sm rounded-[24px] border border-line bg-white/65 p-7 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="display text-3xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
          ) : null}
          <div className="mt-7">{children}</div>
        </div>
        {footer ? (
          <div className="mt-6 text-sm text-ink-soft">{footer}</div>
        ) : null}
      </div>
      <aside
        aria-label="Why Scanstone"
        className="relative hidden overflow-hidden bg-night p-14 text-paper lg:flex lg:flex-col lg:justify-end"
      >
        <div className="gridlines-night absolute inset-0" aria-hidden="true" />
        <div className="relative max-w-md">
          <p className="eyebrow text-paper/50">The covenant</p>
          <p className="display mt-6 text-5xl leading-[1.02]">
            Your redirects keep working, even if you stop paying.
          </p>
          <ul className="mt-10 space-y-3 text-sm text-paper/70">
            {[
              "3 editable codes or short links free",
              "Unlimited static codes, no account needed",
              "Change where a printed code goes, any time",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-verdigris-bright" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
