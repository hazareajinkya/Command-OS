import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./landing.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Command OS — Your AI Agent Squad",
  description:
    "Deploy a full AI workforce from day one. Autonomous agents that coordinate, execute, and deliver in real-time through Mission Control.",
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={playfair.variable}>{children}</div>;
}
