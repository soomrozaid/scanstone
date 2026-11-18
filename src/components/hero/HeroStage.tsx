"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { QRPreview } from "@/components/qr/QRPreview";

type Dest = {
  id: string;
  label: string;
  url: string;
  tint: string;
  kicker: string;
  title: string;
  lines: Array<[string, string]>;
};

const CAFE: Dest[] = [
  {
    id: "spring",
    label: "Spring menu",
    url: "yourcafe.ca/menu/spring",
    tint: "#2c6e63",
    kicker: "Menu · Spring",
    title: "Spring menu",
    lines: [
      ["Pea & mint soup", "9"],
      ["Rhubarb galette", "7"],
      ["Oat flat white", "5.5"],
      ["Garden toast", "12"],
    ],
  },
  {
    id: "brunch",
    label: "Weekend brunch",
    url: "yourcafe.ca/brunch",
    tint: "#b4642d",
    kicker: "Sat & Sun · 9 to 2",
    title: "Brunch",
    lines: [
      ["Shakshuka", "16"],
      ["Buttermilk pancakes", "14"],
      ["Bacon & egg roll", "11"],
      ["Mimosa", "9"],
    ],
  },
  {
    id: "happy",
    label: "Happy hour",
    url: "yourcafe.ca/happy-hour",
    tint: "#7a4a8c",
    kicker: "Weekdays · 3 to 6",
    title: "Happy hour",
    lines: [
      ["Local lager", "6"],
      ["House wine", "7"],
      ["Fries", "5"],
      ["Wings (6)", "10"],
    ],
  },
  {
    id: "closed",
    label: "Closed for the holiday",
    url: "yourcafe.ca/hours",
    tint: "#161411",
    kicker: "Notice",
    title: "Back on the 27th",
    lines: [
      ["Closed", "Dec 24 to 26"],
      ["Gift cards", "Online"],
      ["Catering", "Email us"],
      ["Thanks", "See you soon"],
    ],
  },
];


const SALON: Dest[] = [
  { id: "book", label: "Book online", url: "yoursalon.ca/book", tint: "#7a4a8c", kicker: "Appointments", title: "Book a chair", lines: [["Cut & style", "Tue 2:30"], ["Colour", "Wed 11:00"], ["Beard trim", "Thu 4:15"], ["Blowout", "Fri 10:00"]] },
  { id: "prices", label: "Price list", url: "yoursalon.ca/prices", tint: "#2c6e63", kicker: "Services", title: "Prices", lines: [["Women's cut", "65"], ["Men's cut", "40"], ["Full colour", "140"], ["Treatment", "35"]] },
  { id: "promo", label: "Holiday promo", url: "yoursalon.ca/gift", tint: "#b4642d", kicker: "December only", title: "Gift cards", lines: [["$50 card", "+ $10 free"], ["$100 card", "+ $25 free"], ["Online", "Instant"], ["In store", "Wrapped"]] },
];

const REALTOR: Dest[] = [
  { id: "listing", label: "123 Elm St", url: "yourname.ca/123-elm", tint: "#1f5248", kicker: "For sale", title: "123 Elm Street", lines: [["Beds", "3"], ["Baths", "2"], ["Open house", "Sat 1 to 3"], ["Tour", "Book a time"]] },
  { id: "sold", label: "Sold", url: "yourname.ca/sold", tint: "#161411", kicker: "Update", title: "Sold, thank you", lines: [["123 Elm", "Sold"], ["Selling soon?", "Free valuation"], ["Buying?", "Get alerts"], ["Call", "Any time"]] },
  { id: "next", label: "Next listing", url: "yourname.ca/48-oak", tint: "#b4642d", kicker: "Just listed", title: "48 Oak Crescent", lines: [["Beds", "4"], ["Baths", "3"], ["Lot", "Corner"], ["Tour", "Book a time"]] },
];

const EVENTS: Dest[] = [
  { id: "tickets", label: "Tickets", url: "yourfest.ca/tickets", tint: "#b4642d", kicker: "On sale now", title: "Get tickets", lines: [["Early bird", "25"], ["General", "35"], ["Weekend", "60"], ["Kids", "Free"]] },
  { id: "schedule", label: "Schedule", url: "yourfest.ca/today", tint: "#2c6e63", kicker: "Today", title: "Schedule", lines: [["Doors", "4:00"], ["Opening act", "5:30"], ["Headliner", "8:00"], ["Fireworks", "10:00"]] },
  { id: "photos", label: "Photos", url: "yourfest.ca/photos", tint: "#7a4a8c", kicker: "Thanks for coming", title: "See the photos", lines: [["Day 1", "212 photos"], ["Day 2", "180 photos"], ["Survey", "2 minutes"], ["Next year", "Save the date"]] },
];

type Scene = { id: string; label: string; object: string; head: [string, string]; slug: string; dests: Dest[] };

export const SCENES: Scene[] = [
  { id: "cafe", label: "Café", object: "Table 04 · Scan me", head: ["Good things", "on the menu."], slug: "scst.one/table04", dests: CAFE },
  { id: "salon", label: "Salon", object: "Mirror card", head: ["Book your", "next visit."], slug: "scst.one/mirror", dests: SALON },
  { id: "realtor", label: "Realtor", object: "Yard sign", head: ["Scan for", "the details."], slug: "scst.one/sign", dests: REALTOR },
  { id: "events", label: "Events", object: "Poster", head: ["Summer", "night market."], slug: "scst.one/fest", dests: EVENTS },
];

const QR_OPTIONS = {
  fg: "#161411",
  bg: "#ffffff",
  shape: "rounded" as const,
};

export function HeroStage({
  scenes = ["cafe"],
  demoUrl,
}: {
  scenes?: string[];
  /** Passed from the server so the client bundle skips env validation (zod). */
  demoUrl: string;
}) {
  const list = SCENES.filter((sc) => scenes.includes(sc.id));
  const [sceneIdx, setSceneIdx] = useState(0);
  const scene = list[sceneIdx] ?? SCENES[0]!;
  const DESTS = scene.dests;
  const [i, setI] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [auto, setAuto] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const dest = DESTS[i] ?? DESTS[0]!;

  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => (visible = Boolean(e?.isIntersecting)),
    );
    if (root.current) io.observe(root.current);
    const t = window.setInterval(() => {
      if (!visible || document.hidden) return;
      setI((v) => (v + 1) % DESTS.length);
      setPulse((p) => p + 1);
    }, 3800);
    return () => {
      window.clearInterval(t);
      io.disconnect();
    };
  }, [auto, DESTS.length]);

  function pick(n: number) {
    setAuto(false);
    setI(n);
    setPulse((p) => p + 1);
    track("marketing_demo_changed", { destination: DESTS[n]?.label ?? "" });
  }

  return (
    <div
      ref={root}
      data-testid="hero-visual"
      className="relative"
      aria-label="Interactive example: one printed QR code, four destinations"
      role="group"
    >
      {list.length > 1 ? (
        <div
          role="tablist"
          aria-label="Example business"
          className="mb-6 inline-flex rounded-full border border-line bg-white/60 p-1 text-sm backdrop-blur"
        >
          {list.map((sc, n) => (
            <button
              key={sc.id}
              type="button"
              role="tab"
              aria-selected={n === sceneIdx}
              onClick={() => {
                setAuto(false);
                setSceneIdx(n);
                setI(0);
                setPulse((p) => p + 1);
              }}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 transition-colors sm:px-4 ${n === sceneIdx ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="relative grid grid-cols-[1fr_auto_0.9fr] items-center gap-0 sm:gap-2">
        {/* Table tent */}
        <div className="relative z-10 [perspective:900px]">
          <div className="origin-bottom rounded-[18px] border border-line bg-[#fbf8f1] p-4 shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[var(--ease-settle)] [transform:rotateX(6deg)] hover:[transform:rotateX(0deg)_translateY(-4px)] sm:p-6">
            <p className="eyebrow text-center text-[0.58rem] text-ink-faint sm:text-[0.65rem]">
              {scene.object}
            </p>
            <p className="display mt-2 text-center text-xl leading-none text-ink sm:text-3xl">
              {scene.head[0]}
              <br />
              {scene.head[1]}
            </p>
            <div className="relative mx-auto mt-4 max-w-36 sm:max-w-44">
              <QRPreview
                data={demoUrl}
                options={QR_OPTIONS}
                className="!rounded-xl !border-0 p-1.5"
              />
              <span
                key={`ring-${pulse}`}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-verdigris/0 motion-safe:animate-[qr-ping_900ms_var(--ease-settle)]"
              />
            </div>
            <p className="mt-3 text-center font-mono text-[0.6rem] text-ink-faint sm:text-[0.7rem]">
              {scene.slug}
            </p>
          </div>
          <div className="mx-auto h-2 w-[80%] rounded-b-xl bg-ink/10 blur-[2px]" />
        </div>

        {/* Connector */}
        <div className="relative h-24 w-10 sm:w-20" aria-hidden="true">
          <svg viewBox="0 0 80 96" className="h-full w-full" fill="none">
            <path
              id="hero-wire"
              d="M0 48 C 26 48, 54 48, 80 48"
              stroke="currentColor"
              className="text-ink/25"
              strokeDasharray="3 5"
            />
          </svg>
          <span
            key={`dot-${pulse}`}
            className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-verdigris shadow-[0_0_0_4px_rgb(44_110_99/0.18)] motion-safe:animate-[wire_900ms_var(--ease-settle)_forwards] motion-reduce:hidden"
          />
        </div>

        {/* Phone */}
        <div className="relative z-10">
          <div className="mx-auto w-full max-w-[220px] rounded-[30px] border border-ink/80 bg-ink p-1.5 shadow-[var(--shadow-lift)]">
            <div className="relative aspect-[9/17] overflow-hidden rounded-[24px] bg-white">
              <div className="flex items-center gap-1.5 border-b border-black/5 bg-[#f4f2ee] px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-verdigris" />
                <span className="truncate font-mono text-[0.55rem] text-ink-soft sm:text-[0.62rem]">
                  {dest.url}
                </span>
              </div>
              {DESTS.map((d, n) => (
                <div
                  key={d.id}
                  aria-hidden={n !== i}
                  className={`absolute inset-x-0 bottom-0 top-[30px] px-3.5 pt-4 transition-[opacity,transform] duration-500 ease-[var(--ease-settle)] sm:px-4 ${n === i ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                >
                  <div
                    className="h-16 rounded-xl sm:h-20"
                    style={{
                      background: `linear-gradient(135deg, ${d.tint}, ${d.tint}cc)`,
                    }}
                  />
                  <p className="eyebrow mt-3 text-[0.55rem] text-ink-faint">
                    {d.kicker}
                  </p>
                  <p className="display mt-1 text-lg leading-tight text-ink sm:text-xl">
                    {d.title}
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {d.lines.map(([a, b]) => (
                      <li
                        key={a}
                        className="flex justify-between gap-2 border-b border-dashed border-black/10 pb-1.5 text-[0.62rem] text-ink-soft sm:text-[0.7rem]"
                      >
                        <span className="truncate">{a}</span>
                        <span className="shrink-0 font-mono">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 rounded-2xl border border-line bg-white/60 p-4 backdrop-blur sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-ink-faint">Point the same code at</p>
          <p className="flex items-center gap-1.5 text-xs text-verdigris-deep">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3 8.5l3 3 7-7"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            Printed code unchanged
          </p>
        </div>
        <div
          className="mt-3 flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Example destination"
        >
          {DESTS.map((d, n) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={n === i}
              onClick={() => pick(n)}
              className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm transition-all duration-200 ${n === i ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-soft hover:border-ink-faint hover:text-ink"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p
          className="mt-3 font-mono text-xs text-ink-soft"
          aria-live="polite"
          aria-atomic="true"
        >
          {scene.slug} → {dest.url}
        </p>
      </div>
      <p className="mt-3 text-center text-xs text-ink-faint">
        An example. The printed code opens our real live demo.
      </p>
    </div>
  );
}
