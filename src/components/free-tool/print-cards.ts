/** Browser helpers shared by the printable 4 x 6 in card makers (menu table cards, WiFi signs). */

export function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Rasterizes a 4 x 6 in card SVG to a 300 dpi PNG. */
export async function svgToPng(svg: string): Promise<Blob> {
  const src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("rasterize failed"));
      img.src = src;
    });
    // 4 x 6 in at 300 dpi
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(img, 0, 0, 1200, 1800);
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/png"),
    );
    if (!blob) throw new Error("png failed");
    return blob;
  } finally {
    URL.revokeObjectURL(src);
  }
}

/** Prints the cards, two 4 x 6 in cards per letter-size page, through a hidden frame. */
export function printCards(svgs: string[], title = "Scanstone table cards") {
  const pages: string[] = [];
  for (let i = 0; i < svgs.length; i += 2) {
    pages.push(`<div class="sheet">${svgs.slice(i, i + 2).join("")}</div>`);
  }
  const html =
    `<!doctype html><html><head><meta charset="utf-8"><title>${title.replace(/[<&]/g, "")}</title><style>` +
    `@page{size:letter landscape;margin:0.4in}html,body{margin:0}` +
    `.sheet{display:flex;gap:0.6in;justify-content:center;align-items:flex-start;break-after:page;page-break-after:always}` +
    `.sheet:last-child{break-after:auto;page-break-after:auto}.sheet>svg{width:4in;height:6in;flex:none}` +
    `</style></head><body>${pages.join("")}</body></html>`;
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    throw new Error("print unavailable");
  }
  doc.open();
  doc.write(html);
  doc.close();
  win.focus();
  setTimeout(() => {
    win.print();
    setTimeout(() => frame.remove(), 60_000);
  }, 150);
}

export const fileSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
