import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { UI_TEXT } from "@/constants/messages";

import "./globals.css";

/**
 * Atkinson Hyperlegible Next (plan D61), served from the site itself: one
 * variable file for every weight, preloaded, with an Arial fallback sized to
 * its metrics so nothing shifts when it arrives (plan §22.4).
 */
const atkinson = localFont({
  src: "../assets/fonts/atkinson-hyperlegible-next/atkinson-hyperlegible-next-latin-wght-normal.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-atkinson",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  // A page names itself before the site: "Careers · Al Hidaya Health Care Services".
  title: { default: UI_TEXT.siteName, template: `%s · ${UI_TEXT.siteName}` },
  description: UI_TEXT.siteDescription,
  applicationName: UI_TEXT.siteName,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the safe-area insets reach the page: without "cover", iOS reports them as 0.
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // English at the root; Arabic arrives later under /ar with dir="rtl" (plan D4, §33).
  return (
    <html lang="en" dir="ltr" className={`${atkinson.variable} h-full antialiased`}>
      {/* Extensions write attributes onto <body> before React hydrates; this
          ignores only <body>'s own attributes, one level deep. */}
      <body className="min-h-dvh" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
