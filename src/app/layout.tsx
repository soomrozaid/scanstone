import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { envClient } from "@/config/env.client";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(envClient.APP_URL),
  title: {
    default: "Scanstone — Editable QR codes for print and short links",
    template: "%s · Scanstone",
  },
  description:
    "Create free static QR codes or editable dynamic codes and short links. Update destinations after printing, track scans, and keep redirects working after cancellation.",
  openGraph: {
    siteName: "Scanstone",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

function OrganizationJsonLd() {
  const base = envClient.APP_URL;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Scanstone",
      url: base,
      logo: `${base}/icon`,
      description:
        "A QR code generator whose codes keep working even if you stop paying: free static codes that never expire, and dynamic codes with a written no-shutoff covenant.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Scanstone",
      url: base,
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} grain min-h-screen`}
      >
        <OrganizationJsonLd />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
