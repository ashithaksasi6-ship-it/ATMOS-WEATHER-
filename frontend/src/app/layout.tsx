import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atmos — Hyperlocal Weather Intelligence & Glassmorphic Dashboard",
  description:
    "Production-grade weather application featuring animated glassmorphism, real-time forecast models, air quality metrics, and an intelligent context-aware weather assistant.",
  keywords: ["Weather", "Forecast", "Atmos", "Air Quality", "AQI", "Radar", "Meteorology"],
  icons: {
    icon: [
      { url: "/logo.png?v=2" },
      { url: "/favicon.ico?v=2" },
      { url: "/icon.png?v=2" },
    ],
    shortcut: "/logo.png?v=2",
    apple: "/logo.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png?v=2" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=2" />
      </head>
      <body className="min-h-full flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
