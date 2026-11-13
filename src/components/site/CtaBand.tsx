import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./primitives";
import { LazyVideo } from "@/components/cinema/LazyVideo";

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
    <section className="cta-close">
      <div className="cta-portal">
        <div data-nav="dark" className="cta-portal-card relative overflow-hidden bg-night px-6 py-20 text-center text-paper sm:px-16 sm:py-32">
          <LazyVideo className="absolute inset-0 h-full w-full opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,14,12,0.55),rgba(15,14,12,0.92)_70%)]" aria-hidden="true" />
          <div className="cta-horizon pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-verdigris-bright/80 to-transparent shadow-[0_0_24px_4px_rgba(79,174,155,0.35)]" aria-hidden="true" />
          <Container className="cta-portal-inner relative">
            <h2 className="display mx-auto max-w-4xl text-[clamp(2.4rem,5.5vw,5rem)] leading-[0.98] tracking-[-0.025em]">{title}</h2>
            {body ? (
              <p className="mx-auto mt-6 max-w-xl text-paper/75">{body}</p>
            ) : null}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                data-magnetic
                href={primary.href}
                className="rounded-full bg-verdigris-bright px-8 py-4 font-medium text-night transition-colors hover:bg-paper"
              >
                {primary.label}
              </Link>
              <Link
                data-magnetic
                href={secondary.href}
                className="rounded-full border border-paper/30 bg-night/40 px-8 py-4 font-medium text-paper backdrop-blur transition-colors hover:bg-paper/10"
              >
                {secondary.label}
              </Link>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
