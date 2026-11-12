import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildMatrix } from "@/lib/qr/matrix";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Scanstone — Print it once. Update it anytime.";

const NIGHT = "#12100e";
const PAPER = "#f7f3ea";
const STONE = "#ece5d3";
const VERDIGRIS = "#4fb3a2";
const COPPER = "#d9874a";

/** One SVG path for every dark module of a real, scannable code. */
function qrPath(data: string) {
  const m = buildMatrix(data, "M");
  let d = "";
  for (let r = 0; r < m.size; r++)
    for (let c = 0; c < m.size; c++)
      if (m.get(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return { d, size: m.size };
}

const font = (f: string) => readFile(join(process.cwd(), "assets/og", f));

export default async function OGImage() {
  const [serif, serifItalic, mono, sans] = await Promise.all([
    font("Fraunces-Medium.ttf"),
    font("Fraunces-Italic.ttf"),
    font("IBMPlexMono-Regular.ttf"),
    font("Inter-Regular.ttf"),
  ]);
  const qr = qrPath("https://www.scanstone.ca");
  const pad = 3;
  const box = qr.size + pad * 2;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: NIGHT,
        fontFamily: "Inter",
        overflow: "hidden",
      }}
    >
      {/* Aurora: the same verdigris and copper light as the site hero. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(44,110,99,0.62) 0%, rgba(44,110,99,0) 48%), radial-gradient(circle at 86% 96%, rgba(217,135,74,0.38) 0%, rgba(217,135,74,0) 46%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "64px 0 64px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: PAPER,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M6.5 7.5h5v5h-5z" stroke={NIGHT} strokeWidth="1.6" fill="none" />
              <rect x="14.5" y="7.5" width="2" height="2" fill="#2c6e63" />
              <rect x="6.5" y="15" width="2" height="2" fill={NIGHT} />
              <rect x="10" y="15" width="6.5" height="2" fill="#2c6e63" />
            </svg>
          </div>
          <div style={{ fontFamily: "Fraunces", fontSize: 34, fontWeight: 500, color: PAPER }}>Scanstone</div>
          <div
            style={{
              marginLeft: 14,
              fontFamily: "Plex Mono",
              fontSize: 16,
              letterSpacing: 3,
              color: COPPER,
              textTransform: "uppercase",
            }}
          >
            Editable QR codes for print
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Fraunces", fontSize: 100, fontWeight: 500, color: PAPER, lineHeight: 1, letterSpacing: "-3px" }}>
            Print it once.
          </div>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 100, lineHeight: 1.05, letterSpacing: "-3px" }}>
            <span style={{ color: VERDIGRIS, fontStyle: "italic", fontWeight: 400 }}>Update it</span>
            <span style={{ width: 26 }} />
            <span style={{ color: PAPER, fontWeight: 500 }}>anytime.</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "rgba(247,243,234,0.72)", maxWidth: 640 }}>
          3 free codes or links. Redirects keep working even if you cancel.
        </div>
      </div>

      <div
        style={{
          width: 430,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 300,
            padding: "26px 26px 22px",
            background: STONE,
            borderRadius: 10,
            transform: "rotate(-4deg)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.55), 0 0 90px rgba(79,179,162,0.25)",
          }}
        >
          <div style={{ fontFamily: "Plex Mono", fontSize: 13, letterSpacing: 3, color: "#6b6357", marginBottom: 14 }}>
            SCAN FOR THE MENU
          </div>
          <svg width="248" height="248" viewBox={`${-pad} ${-pad} ${box} ${box}`} shapeRendering="crispEdges">
            <rect x={-pad} y={-pad} width={box} height={box} fill={PAPER} />
            <path d={qr.d} fill={NIGHT} />
          </svg>
          <div style={{ width: 120, height: 4, background: "#2c6e63", borderRadius: 2, marginTop: 16 }} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 92,
            right: 34,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: 999,
            background: "rgba(18,16,14,0.9)",
            border: "1px solid rgba(247,243,234,0.18)",
            fontFamily: "Plex Mono",
            fontSize: 17,
            color: PAPER,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 5, background: VERDIGRIS }} />
          now: lunch menu
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: serif, style: "normal", weight: 500 },
        { name: "Fraunces", data: serifItalic, style: "italic", weight: 400 },
        { name: "Plex Mono", data: mono, style: "normal", weight: 400 },
        { name: "Inter", data: sans, style: "normal", weight: 400 },
      ],
    },
  );
}
