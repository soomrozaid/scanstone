import { cx } from "@/components/site/primitives";

/** Night hero shell for interior pages: drifting light, grid, nav turns light. */
export function DarkHero({
  children,
  className,
  glow = "70% 30%",
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  return (
    <section
      data-nav="dark"
      className={cx("relative -mt-16 overflow-hidden bg-night pt-16 text-paper", className)}
    >
      <div className="aurora pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="gridlines-night pointer-events-none absolute inset-0 opacity-60"
        style={{ maskImage: `radial-gradient(ellipse at ${glow}, black 15%, transparent 70%)` }}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </section>
  );
}
