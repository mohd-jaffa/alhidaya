import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { connection } from "next/server";

import { UI_TEXT } from "@/constants/messages";
import { siteMetadataBase } from "@/lib/seo/metadata";

import "./globals.css";

/**
 * Inter Tight (plan D108), served from the site itself: one variable file for
 * every weight, preloaded, with an Arial fallback sized to its metrics so
 * nothing shifts when it arrives (plan §22.4).
 */
const interTight = localFont({
  src: "../assets/fonts/inter-tight/inter-tight-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter-tight",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  // A page names itself before the site: "Careers · Al Hidaya Health Care Service".
  title: { default: UI_TEXT.siteName, template: `%s · ${UI_TEXT.siteName}` },
  description: UI_TEXT.siteDescription,
  applicationName: UI_TEXT.siteName,
  // Canonical and share addresses are absolute, on the site's own domain (plan §19).
  metadataBase: siteMetadataBase(),
  // A shared page shows its picture large (plan §19).
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the safe-area insets reach the page: without "cover", iOS reports them as 0.
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Every HTML response (including error pages) needs its own CSP nonce. Published data stays cached.
  await connection();
  // English at the root; Arabic arrives later under /ar with dir="rtl" (plan D4, §33).
  return (
    <html lang="en" dir="ltr" className={`${interTight.variable} h-full antialiased`}>
      {/* Extensions write attributes onto <body> before React hydrates; this
          ignores only <body>'s own attributes, one level deep. */}
      <body className="min-h-dvh" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
