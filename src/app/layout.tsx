import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { DemoTourRunner } from "@/components/demo/DemoTourRunner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tavola — Wood-fired Mediterranean in Al Khobar",
  description:
    "Book a table at Tavola in under a minute. Real-time availability, instant confirmation.",
};

// Dark is the default; honor a persisted light choice before first paint to
// avoid a theme flash. Storage key must match src/components/site/ThemeToggle.tsx.
const themeInitScript = `try{if(localStorage.getItem("tavola.theme")==="light")document.documentElement.classList.remove("dark")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        {/* Root-level so demo tours can cross between the site and /admin. */}
        <DemoTourRunner />
      </body>
    </html>
  );
}
