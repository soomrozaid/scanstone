/**
 * Shrinks a rendered QR SVG string for decorative marketing use: rounds the
 * float noise (13.319999999999999 → 13.32) without changing the shape.
 */
export function slimSvg(svg: string): string {
  return svg.replace(/-?\d+\.\d{3,}/g, (n) => String(Math.round(Number(n) * 100) / 100));
}
