"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    t: "Cancel your plan",
    d: "Your codes keep redirecting. You lose the extras, not the code.",
    status: ["Plan", "Cancelled"],
  },
  {
    t: "Blow past your limits",
    d: "Scans never get blocked. Limits gate creating codes, never scanning them.",
    status: ["Codes", "4 of 3"],
  },
  {
    t: "Never log in again",
    d: "Codes don't rot with inactivity. Print it and forget it.",
    status: ["Last login", "2 years ago"],
  },
];

export function CovenantStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const n = Number((e.target as HTMLElement).dataset.step);
            setActive(n);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const step = STEPS[active] ?? STEPS[0]!;

  return (
    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="mx-auto w-full max-w-[260px] rounded-[34px] bg-night-raised p-2 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] ring-1 ring-night-line">
          <div className="overflow-hidden rounded-[27px] bg-white">
            <div className="flex items-center gap-1.5 border-b border-black/5 bg-[#f4f2ee] px-4 py-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-verdigris" />
              <span className="font-mono text-[0.62rem] text-ink-soft">yourcafe.ca/menu</span>
            </div>
            <div className="p-5">
              <div className="h-20 rounded-xl bg-gradient-to-br from-verdigris to-verdigris-deep" />
              <p className="display mt-4 text-xl text-ink">Tonight&apos;s menu</p>
              {["Soup of the day", "Bison burger", "Saskatoon berry pie"].map((l) => (
                <p key={l} className="mt-2.5 border-b border-dashed border-black/10 pb-2 text-xs text-ink-soft">
                  {l}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-6 flex max-w-[300px] items-center justify-between rounded-full border border-night-line bg-night-raised px-5 py-3 text-sm">
          <span className="text-paper/50" aria-live="polite">
            {step.status[0]}: <span className="text-copper-bright">{step.status[1]}</span>
          </span>
          <span className="flex items-center gap-2 font-mono text-xs text-verdigris-bright">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-verdigris-bright opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-verdigris-bright" />
            </span>
            Redirecting
          </span>
        </div>
      </div>

      <ol className="space-y-6 lg:space-y-[28vh] lg:py-[12vh]">
        {STEPS.map((s, n) => (
          <li
            key={s.t}
            ref={(el) => {
              refs.current[n] = el;
            }}
            data-step={n}
            className={`rounded-[24px] border p-8 transition-all duration-500 sm:p-10 ${n === active ? "border-verdigris-bright/40 bg-night-raised" : "border-night-line bg-transparent lg:opacity-40"}`}
          >
            <span className="font-mono text-xs text-verdigris-bright">0{n + 1}</span>
            <h3 className="display mt-4 text-3xl sm:text-4xl">{s.t}</h3>
            <p className="mt-4 max-w-md leading-relaxed text-paper/65">{s.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
