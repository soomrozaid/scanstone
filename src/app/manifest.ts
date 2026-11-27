import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scanstone",
    short_name: "Scanstone",
    description:
      "QR codes that keep working. Free static codes, and editable dynamic codes with scan analytics.",
    start_url: "/",
    display: "browser",
    background_color: "#f7f3ea",
    theme_color: "#1c1917",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
