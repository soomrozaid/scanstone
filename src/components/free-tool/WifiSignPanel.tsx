"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { Button, Card, Input, Label } from "@/components/ui";
import {
  DEFAULT_WIFI_HEADLINE,
  DEFAULT_WIFI_NOTE,
  renderWifiCardSvg,
  type WifiCardInput,
} from "@/lib/qr/wifi-card";
import { download, fileSlug, printCards, svgToPng } from "./print-cards";

const EXAMPLE: WifiCardInput = {
  ssid: "Corner Cafe Guest",
  password: "example-pass",
  security: "WPA",
};

/**
 * Turns the WiFi details already typed into the generator into a printable
 * 4 x 6 in "Scan to join" sign. Everything happens in the browser.
 */
export function WifiSignPanel({
  wifi,
  ready,
  onSaved,
}: {
  wifi: Pick<WifiCardInput, "ssid" | "password" | "security" | "hidden">;
  ready: boolean;
  onSaved: () => void;
}) {
  const [place, setPlace] = useState("");
  const [headline, setHeadline] = useState(DEFAULT_WIFI_HEADLINE);
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasPassword = !!wifi.password && wifi.security !== "nopass";

  const svg = renderWifiCardSvg({
    ...(ready ? wifi : EXAMPLE),
    place,
    headline,
    showPassword,
    note: DEFAULT_WIFI_NOTE,
  });
  const fileBase = `wifi-sign${wifi.ssid ? `-${fileSlug(wifi.ssid)}` : ""}`;

  return (
    <section
      id="wifi-sign"
      aria-labelledby="wifi-sign-h"
      className="mt-4 scroll-mt-24"
    >
      <Card className="!rounded-[22px] !bg-paper p-5 sm:p-6">
        <h2 id="wifi-sign-h" className="text-base font-semibold text-ink">
          Print a WiFi sign
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          A 4 × 6 in card with the code, the network name and the password
          written out, for laptops and TVs that can&apos;t scan.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_150px] lg:grid-cols-1 xl:grid-cols-[1fr_130px]">
          <div className="space-y-4">
            <div>
              <Label htmlFor="ws-place">Place name (optional)</Label>
              <Input
                id="ws-place"
                maxLength={60}
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Corner Cafe"
              />
            </div>
            <div>
              <Label htmlFor="ws-head">Headline</Label>
              <Input
                id="ws-head"
                maxLength={50}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>
            {hasPassword || !ready ? (
              <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-verdigris"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <span>Write the password on the sign</span>
              </label>
            ) : null}
          </div>
          <div
            aria-label={
              ready ? "Preview of your WiFi sign" : "Example WiFi sign"
            }
            role="img"
            className={`mx-auto w-full max-w-[150px] self-start overflow-hidden rounded-lg shadow-[var(--shadow-card)] [&>svg]:h-auto [&>svg]:w-full ${ready ? "" : "opacity-40"}`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
          <Button
            type="button"
            className="!rounded-full py-3"
            disabled={!ready}
            onClick={() => {
              setError(null);
              try {
                printCards([svg, svg], "WiFi sign");
                onSaved();
                track("wifi_sign_printed", {
                  password: showPassword && hasPassword ? "shown" : "hidden",
                });
              } catch {
                setError(
                  "Printing didn't start. Try another browser, or download the PNG.",
                );
              }
            }}
          >
            Print sign
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!rounded-full px-5 py-3"
            disabled={!ready}
            onClick={async () => {
              setError(null);
              try {
                const blob = await svgToPng(svg);
                const u = URL.createObjectURL(blob);
                download(u, `${fileBase}.png`);
                URL.revokeObjectURL(u);
                onSaved();
                track("wifi_sign_downloaded", { format: "png" });
              } catch {
                setError("Download failed. Try another browser.");
              }
            }}
          >
            PNG
          </Button>
        </div>
        {error ? (
          <p role="alert" className="mt-2 text-center text-xs text-danger">
            {error}
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          {ready
            ? "Prints two signs on one letter page, or save them as a PDF from the print window. Scan a test print with your own phone before you put it up."
            : "Type your network name above to make your sign."}{" "}
          Anyone who can see the sign can join, so keep it inside, ideally on a
          guest network.
        </p>
      </Card>
    </section>
  );
}
