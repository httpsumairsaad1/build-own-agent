import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "vibeXnews — AI-Powered News Analysis & Framing",
  description:
    "vibeXnews collects real news articles from verified sources, analyzes political framing and sentiment with AI, and delivers data-driven clarity.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#0A0A0A] text-white font-sans selection:bg-[#E64A19] selection:text-white">
        {children}
      </body>
    </html>
  );
}
