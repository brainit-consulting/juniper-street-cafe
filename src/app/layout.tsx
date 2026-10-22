import type { Metadata } from "next";
import { Albert_Sans, Young_Serif } from "next/font/google";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const body = Albert_Sans({
  variable: "--app-font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const display = Young_Serif({
  variable: "--app-font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.name, template: "%s · Juniper Street Café" },
  description: site.description,
  // Private tool: keep it out of search results. Also change src/app/robots.ts if this ever goes public.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col">{children}</body>
    </html>
  );
}
