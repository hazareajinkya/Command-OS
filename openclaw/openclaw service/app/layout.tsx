import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AICE OpenClaw — World's First OpenClaw Service Provider",
  description:
    "We set up your OpenClaw in a secure, production-ready environment. No terminal commands. No hassle. Just working AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} min-h-screen bg-[#0a0a0f] text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
