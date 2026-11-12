import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./primitives";

export function CtaBand({
  title,
  body,
  primary = { href: "/signup", label: "Create your first code" },
  secondary = { href: "/qr-code-generator", label: "Use the free generator" },
}: {
  title: ReactNode;
  body?: ReactNode;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="pb-24 sm:pb-32">
      <Container>
        <div className="relative overflow-hidden rounded-[32px] bg-verdigris-deep px-6 py-16 text-center text-paper sm:px-16 sm:py-24">
          <div className="gridlines-night absolute inset-0 opacity-70" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="absolute -bottom-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-verdigris-bright/30 blur-3xl"
          />
          <div className="relative">
            <h2 className="display mx-auto max-w-3xl text-h2">{title}</h2>
            {body ? (
              <p className="mx-auto mt-6 max-w-xl text-paper/75">{body}</p>
            ) : null}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href={primary.href}
                className="rounded-full bg-paper px-7 py-3.5 font-medium text-ink transition hover:bg-white"
              >
                {primary.label}
              </Link>
              <Link
                href={secondary.href}
                className="rounded-full border border-paper/30 px-7 py-3.5 font-medium text-paper transition hover:bg-paper/10"
              >
                {secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
