import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ScrollAnimator } from "@/components/ScrollAnimator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sentry Forensics",
    template: "%s | Sentry Forensics",
  },
  description:
    "Sentry Forensics delivers a security-first crypto incident assessment workflow—evidence-led, privacy-aware, and designed to operate without collecting seed phrases, private keys, or other secrets.",
  icons: {
    icon: "/emblem.svg",
    apple: "/emblem.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
