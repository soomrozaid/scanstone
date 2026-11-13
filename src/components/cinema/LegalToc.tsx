"use client";

import { useEffect, useState } from "react";

/** Sticky contents rail built from the page's h2s; the section you're reading glows. */
export function LegalToc() {
  const [items, setItems] = useState<Array<{ id: string; text: string }>>([]);
  const [active, setActive] = useState("");
  useEffect(() => {
    const hs = [...document.querySelectorAll<HTMLHeadingElement>("[data-legal] h2")];
    hs.forEach((h, i) => {
      if (!h.id) h.id = `s-${i + 1}-${(h.textContent ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}`;
      h.classList.add("scroll-mt-28");
    });
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    hs.forEach((h) => io.observe(h));
    const t = window.setTimeout(() => setItems(hs.map((h) => ({ id: h.id, text: h.textContent ?? "" }))), 0);
    // Deep links (e.g. /terms#covenant): land the target just under the nav
    // once the page has settled, whatever moved above it while loading.
    const land = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      const y = el.getBoundingClientRect().top + scrollY - 96;
      const l = (window as Window & { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
      if (l) l.scrollTo(y, { immediate: true });
      else scrollTo(0, y);
    };
    const t2 = window.setTimeout(land, 450);
    const t3 = window.setTimeout(land, 1200);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);
  if (!items.length) return null;
  return (
    <nav aria-label="On this page" className="sticky top-28 hidden self-start lg:block">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">On this page</p>
      <ol className="mt-5 space-y-1 border-l border-line">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`toc-link -ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors duration-300 ${it.id === active ? "border-verdigris text-ink" : "border-transparent text-ink-faint hover:text-ink"}`}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
