import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { isIndexingEnabled } from "@/lib/seo/url";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  style: ["normal"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Apex Climate Solutions — Dallas HVAC repair, replacement and tune-ups",
    template: "%s | Apex Climate Solutions",
  },
  description:
    "A one-crew Dallas HVAC shop for emergency repair, replacement and seasonal tune-ups. Book in under a minute; the request lands with the owner.",
  robots: isIndexingEnabled()
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
