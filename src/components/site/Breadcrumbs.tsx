import Link from "next/link";

type Crumb = { href?: string; label: string };

/** Plain trail so visitors always know where they are and can go back one step. */
export function Breadcrumbs({ items, tone = "paper" }: { items: Crumb[]; tone?: "paper" | "night" }) {
  if (items.length === 0) return null;
  const muted = tone === "night" ? "text-paper/60 hover:text-paper" : "text-ink-soft hover:text-ink";
  const current = tone === "night" ? "text-paper" : "text-ink";
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <li>
          <Link href="/" className={`${muted} underline-offset-2 hover:underline`}>
            Home
          </Link>
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              <span aria-hidden="true" className={muted}>
                /
              </span>
              {last || !item.href ? (
                <span className={current} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={`${muted} underline-offset-2 hover:underline`}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
