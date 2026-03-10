import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ScrollAnimator } from "@/components/ScrollAnimator";

export const metadata: Metadata = {
  title: {
    default: "Sentry Forensics",
    template: "%s | Sentry Forensics",
  },
  description:
    "Sentry Forensics delivers a security-first crypto incident assessment workflow — evidence-led, privacy-aware, designed to operate without collecting seed phrases, private keys, or other secrets.",
  icons: { icon: "/emblem.svg", apple: "/emblem.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
      </head>
      <body className="antialiased">
        <ScrollAnimator />
        <NavBar />
        {children}
        <Footer />
        <Script
          id="chatway"
          strategy="afterInteractive"
          src="https://cdn.chatway.app/widget.js?id=aUwIgVCFpriT"
        />
      </body>
    </html>
  );
}
