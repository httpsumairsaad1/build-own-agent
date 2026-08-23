import React from "react";
import Link from "next/link";
import { VXNLogo } from "./Header";

export function Footer() {
  return (
    <footer className="border-t border-[#2C2C2C] bg-[#0A0A0A] px-4 lg:px-8 py-8 mt-12">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start space-y-1">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <VXNLogo size="sm" />
          </Link>
          <p className="text-xs text-[#757575]">
            Stay Vibe. Data-driven. Stay consistent. Stay un-biased.
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#9E9E9E]">
          <Link href="/" className="hover:text-white transition-colors">
            All Feeds
          </Link>
          <Link href="/politics" className="hover:text-white transition-colors">
            Politics
          </Link>
          <Link href="/tech-vibe" className="hover:text-white transition-colors">
            Tech-Vibe
          </Link>
          <Link href="/social-change" className="hover:text-white transition-colors">
            Social Change
          </Link>
          <Link href="/economy" className="hover:text-white transition-colors">
            Economy
          </Link>
          <Link href="/pop-culture" className="hover:text-white transition-colors">
            Pop Culture
          </Link>
          <Link href="/sign-in" className="hover:text-[#FF9800] transition-colors">
            Sign In
          </Link>
        </div>

        <div className="text-xs text-[#616161] font-mono">
          Design System v1.1 • August 23, 2026
        </div>
      </div>
    </footer>
  );
}
