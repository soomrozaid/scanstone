"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ScanStory = dynamic(() => import("./ScanStory").then((m) => m.ScanStory), {
  ssr: false,
  loading: () => <StoryShell />,
});

/** Same night stage the story paints first, so swapping it in doesn't shift anything. */
function StoryShell({ shellRef }: { shellRef?: React.Ref<HTMLElement> }) {
  return (
    <section
      ref={shellRef}
      id="how-it-works"
      aria-labelledby="how-h"
      data-nav="dark"
      className="relative scroll-mt-0 bg-night text-paper motion-reduce:hidden"
    >
      <h2 id="how-h" className="sr-only">
        How it works
      </h2>
      <div className="relative h-[100svh] overflow-hidden">
        <div className="aurora pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="gridlines-night pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      </div>
    </section>
  );
}

/**
 * The pinned story is about 470 nodes and the heaviest script on home, so it
 * isn't hydrated with the page. Its code loads once you scroll within about half a
 * screen of it (or jump to #how-it-works). The static how-it-works section
 * carries the same content in the HTML for search and reduced motion.
 */
export function LazyScanStory({ qrUrl }: { qrUrl: string }) {
  const shell = useRef<HTMLElement>(null);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = shell.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          io.disconnect();
          setLoad(true);
        }
      },
      { rootMargin: "60% 0px" },
    );
    io.observe(el);
    const onHash = () => location.hash === "#how-it-works" && setLoad(true);
    window.addEventListener("hashchange", onHash);
    return () => {
      io.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, []);
  return load ? <ScanStory qrUrl={qrUrl} /> : <StoryShell shellRef={shell} />;
}
