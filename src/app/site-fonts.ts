import localFont from "next/font/local";

const font0 = localFont({
  src: "../assets/fonts/inter/inter-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-inter",
  adjustFontFallback: "Arial",
});
const font1 = localFont({
  src: "../assets/fonts/atkinson-hyperlegible-next/atkinson-hyperlegible-next-latin-wght-normal.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-atkinson-hyperlegible-next",
  adjustFontFallback: "Arial",
});
const font2 = localFont({
  src: "../assets/fonts/roboto/roboto-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-roboto",
  adjustFontFallback: "Arial",
});
const font3 = localFont({
  src: "../assets/fonts/open-sans/open-sans-latin-wght-normal.woff2",
  weight: "300 800",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-open-sans",
  adjustFontFallback: "Arial",
});
const font4 = localFont({
  src: "../assets/fonts/source-sans-3/source-sans-3-latin-wght-normal.woff2",
  weight: "200 900",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-source-sans-3",
  adjustFontFallback: "Arial",
});
const font5 = localFont({
  src: "../assets/fonts/nunito-sans/nunito-sans-latin-wght-normal.woff2",
  weight: "200 900",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-nunito-sans",
  adjustFontFallback: "Arial",
});
const font6 = localFont({
  src: "../assets/fonts/manrope/manrope-latin-wght-normal.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-manrope",
  adjustFontFallback: "Arial",
});
const font7 = localFont({
  src: "../assets/fonts/dm-sans/dm-sans-latin-wght-normal.woff2",
  weight: "100 1000",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-dm-sans",
  adjustFontFallback: "Arial",
});
const font8 = localFont({
  src: "../assets/fonts/work-sans/work-sans-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-work-sans",
  adjustFontFallback: "Arial",
});
const font9 = localFont({
  src: "../assets/fonts/playfair-display/playfair-display-latin-wght-normal.woff2",
  weight: "400 900",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-playfair-display",
  adjustFontFallback: "Times New Roman",
});
const font10 = localFont({
  src: "../assets/fonts/cormorant-garamond/cormorant-garamond-latin-wght-normal.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-cormorant-garamond",
  adjustFontFallback: "Times New Roman",
});
const font11 = localFont({
  src: "../assets/fonts/fraunces/fraunces-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
  adjustFontFallback: "Times New Roman",
});
const font12 = localFont({
  src: "../assets/fonts/space-grotesk/space-grotesk-latin-wght-normal.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-space-grotesk",
  adjustFontFallback: "Arial",
});
const font13 = localFont({
  src: "../assets/fonts/syne/syne-latin-wght-normal.woff2",
  weight: "400 800",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-syne",
  adjustFontFallback: "Arial",
});
export const siteFontVariables = [
  font0.variable,
  font1.variable,
  font2.variable,
  font3.variable,
  font4.variable,
  font5.variable,
  font6.variable,
  font7.variable,
  font8.variable,
  font9.variable,
  font10.variable,
  font11.variable,
  font12.variable,
  font13.variable,
].join(" ");
