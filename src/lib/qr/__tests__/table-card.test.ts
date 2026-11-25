import { describe, expect, it } from "vitest";
import { Resvg } from "@resvg/resvg-js";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { displayLink, parseTables, renderTableCardSvg, tableLabel } from "../table-card";

function decode(svg: string): string | null {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 800 } }).render().asPng();
  const { data, width, height } = PNG.sync.read(Buffer.from(png));
  return jsQR(new Uint8ClampedArray(data), width, height)?.data ?? null;
}

describe("table cards", () => {
  const url = "https://www.examplecafe.ca/menu.pdf";

  it("renders a card whose code scans to the menu link", () => {
    const svg = renderTableCardSvg({
      data: url,
      restaurant: "Corner Cafe",
      headline: "Scan for our menu",
      note: "Prefer a paper menu? Just ask.",
      table: "4",
    });
    expect(svg).toContain('width="4in"');
    expect(svg).toContain("TABLE 4");
    expect(svg).toContain("examplecafe.ca/menu.pdf");
    expect(decode(svg)).toBe(url);
  });

  it("still scans with long text everywhere", () => {
    const long = "https://www.a-very-long-restaurant-domain-name.example.com/menus/2026/winter/dinner-menu-final.pdf";
    const svg = renderTableCardSvg({
      data: long,
      restaurant: "The Extremely Long Name Bistro and Wine Bar of Downtown Saskatoon",
      headline: "Scan here to see tonight's full dinner and drinks menu",
      note: "Prefer a paper menu? Just ask your server and we will bring one right away.",
      table: "Patio 12",
    });
    expect(decode(svg)).toBe(long);
  });

  it("escapes text", () => {
    const svg = renderTableCardSvg({ data: url, restaurant: 'Fish & <Chips> "Co"' });
    expect(svg).toContain("Fish &amp; &lt;Chips&gt; &quot;Co&quot;");
  });

  it("can leave the link off", () => {
    expect(renderTableCardSvg({ data: url, showLink: false })).not.toContain("examplecafe.ca/menu.pdf<");
  });

  it("parses table lists", () => {
    expect(parseTables("1-3, Bar, Patio 1-2")).toEqual(["1", "2", "3", "Bar", "Patio 1", "Patio 2"]);
    expect(parseTables("5-3")).toEqual(["3", "4", "5"]);
    expect(parseTables("1-500")).toHaveLength(100);
    expect(parseTables(" , ")).toEqual([]);
  });

  it("labels tables", () => {
    expect(tableLabel("7")).toBe("Table 7");
    expect(tableLabel("Bar")).toBe("Bar");
    expect(displayLink("https://www.cafe.ca/")).toBe("www.cafe.ca");
  });
});
