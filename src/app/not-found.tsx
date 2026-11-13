import Link from "next/link";
import { Wordmark } from "@/components/marketing/Wordmark";

// 5x7 module font for the digits, drawn like code modules.
const GLYPHS: Record<string, string[]> = {
  "4": ["10001", "10001", "10001", "11111", "00001", "00001", "00001"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
};

function ModuleDigits({ text }: { text: string }) {
  const cells: Array<{ x: number; y: number; d: number; loose: boolean }> = [];
  [...text].forEach((ch, gi) => {
    (GLYPHS[ch] ?? []).forEach((row, y) =>
      [...row].forEach((on, x) => {
        if (on !== "1") return;
        const gx = gi * 6 + x;
        const h = (gx * 31 + y * 17) % 23;
        cells.push({ x: gx, y, d: Math.round(Math.hypot(gx - 8, y - 3) * 70 + h * 12), loose: h === 3 || h === 11 });
      }),
    );
  });
  const W = text.length * 6 - 1;
  return (
    <div aria-hidden="true" className="relative mx-auto" style={{ width: "min(78vw, 36rem)", aspectRatio: `${W} / 7` }}>
      {cells.map((c) => (
        <span
          key={`${c.x}-${c.y}`}
          className={`nf-cell absolute rounded-[3px] bg-paper ${c.loose ? "nf-loose bg-verdigris-bright" : ""}`}
          style={
            {
              left: `${(c.x / W) * 100}%`,
              top: `${(c.y / 7) * 100}%`,
              width: `${(1 / W) * 100 - 0.6}%`,
              height: `${(1 / 7) * 100 - 2}%`,
              "--d": `${c.d}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-night px-5 text-center text-paper">
      <div className="aurora pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="gridlines-night pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative">
        <Link href="/" aria-label="Scanstone home" className="inline-block text-paper">
          <Wordmark tone="paper" />
        </Link>
        <div className="mt-12">
          <ModuleDigits text="404" />
        </div>
        <h1 className="display mt-12 text-h2">Nothing carved here</h1>
        <p className="mx-auto mt-5 max-w-md text-paper/70">
          This page doesn&apos;t exist. If you scanned a printed code and landed
          here, the code&apos;s owner may have deleted it.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-verdigris-bright px-6 py-3 font-medium text-night transition hover:bg-paper"
          >
            Back to Scanstone
          </Link>
          <Link
            href="/qr-code-generator"
            className="rounded-full border border-paper/25 px-6 py-3 font-medium text-paper transition hover:bg-paper/10"
          >
            Free QR generator
          </Link>
        </div>
      </div>
    </main>
  );
}
