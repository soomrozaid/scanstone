import type { ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "copper",
  className,
}: {
  children: ReactNode;
  tone?: "copper" | "verdigris" | "faint" | "paper";
  className?: string;
}) {
  const tones = {
    copper: "text-copper",
    verdigris: "text-verdigris",
    faint: "text-ink-faint",
    paper: "text-paper/60",
  };
  return <p className={cx("eyebrow", tones[tone], className)}>{children}</p>;
}

/** Linear-style figure caption: "Fig. 02  Retarget". */
export function Fig({
  n,
  children,
  className,
}: {
  n: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cx(
        "eyebrow flex items-center gap-3 text-ink-faint",
        className,
      )}
    >
      <span>Fig. {n}</span>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
      <span>{children}</span>
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  className,
  dark = false,
  center = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  className?: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={cx(
        "max-w-3xl",
        center && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Eyebrow tone={dark ? "paper" : "copper"}>{eyebrow}</Eyebrow>
      ) : null}
      <h2
        id={id}
        className={cx(
          "display mt-4 text-h2",
          dark ? "text-paper" : "text-ink",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cx(
            "mt-6 text-lead",
            dark ? "text-paper/70" : "text-ink-soft",
            center && "mx-auto",
            "max-w-2xl",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
