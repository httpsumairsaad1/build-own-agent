"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";

// --- Stylized Monogram Brand Logo ---
export function VXNLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const height = size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";
  return (
    <div className={`flex items-center gap-2.5 select-none ${height}`}>
      {/* Stylized VXN Monogram Icon */}
      <div className="relative flex items-center justify-center">
        <svg
          className={`${size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-10 h-10"}`}
          viewBox="0 0 48 48"
          fill="none"
        >
          {/* Outer glow aura */}
          <circle cx="24" cy="24" r="22" fill="url(#vxn-glow)" opacity="0.15" />

          {/* Main VXN Geometry */}
          <path d="M8 12L18 36H24L14 12H8Z" fill="url(#vxn-grad-1)" />
          <path d="M20 20L28 36H34L26 20H20Z" fill="url(#vxn-grad-2)" />
          <path d="M32 12L40 36H44L36 12H32Z" fill="url(#vxn-grad-3)" />
          {/* Floating Ember Accent */}
          <circle cx="28" cy="14" r="3.5" fill="#FFD54F" />

          <defs>
            <radialGradient id="vxn-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E64A19" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="vxn-grad-1"
              x1="8"
              y1="12"
              x2="24"
              y2="36"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#D32F2F" />
              <stop offset="1" stopColor="#E64A19" />
            </linearGradient>
            <linearGradient
              id="vxn-grad-2"
              x1="20"
              y1="20"
              x2="34"
              y2="36"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E64A19" />
              <stop offset="1" stopColor="#FF9800" />
            </linearGradient>
            <linearGradient
              id="vxn-grad-3"
              x1="32"
              y1="12"
              x2="44"
              y2="36"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FF9800" />
              <stop offset="1" stopColor="#FFD54F" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className="font-bold text-white tracking-tight text-xl leading-none">
            Vibe
          </span>
          <span className="font-bold text-[#FF9800] tracking-tight text-xl leading-none">
            X
          </span>
          <span className="font-bold text-white tracking-tight text-xl leading-none">
            news
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-[#9E9E9E] font-medium leading-tight mt-0.5">
          Perspectives &amp; AI
        </span>
      </div>
    </div>
  );
}

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function Header({ searchQuery = "", onSearchChange }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "All Feeds" },
    { href: "/politics", label: "Politics" },
    { href: "/tech-vibe", label: "Tech-Vibe" },
    { href: "/social-change", label: "Social Change" },
    { href: "/economy", label: "Economy" },
    { href: "/pop-culture", label: "Pop Culture" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2C2C2C] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <VXNLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#9E9E9E]">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? "text-white bg-[#1E1E1E] border border-[#2C2C2C] font-semibold"
                      : "hover:text-white hover:bg-[#1A1A1A]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search Input Bar */}
          <div className="relative hidden sm:flex items-center">
            <svg
              className="absolute left-3 w-4 h-4 text-[#757575]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search perspectives & topics..."
              className="w-52 lg:w-68 pl-9 pr-8 py-1.5 text-xs bg-[#1E1E1E] text-white placeholder-[#757575] border border-[#2C2C2C] rounded-full focus:outline-none focus:border-[#E64A19] focus:ring-1 focus:ring-[#E64A19] transition-all"
            />
            {searchQuery && onSearchChange && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 text-xs text-[#757575] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Clerk Auth Integration via Core 3 <Show> component */}
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="px-3.5 py-1.5 text-xs font-semibold text-[#E0E0E0] bg-[#1E1E1E] hover:bg-[#2C2C2C] border border-[#2C2C2C] rounded-md transition-colors"
            >
              Sign In
            </Link>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full border border-[#2C2C2C] hover:border-[#E64A19] transition-colors",
                  userButtonPopoverCard: "bg-[#1E1E1E] border border-[#2C2C2C] shadow-2xl text-white",
                  userButtonPopoverActionButton: "hover:bg-[#2C2C2C] text-white",
                  userButtonPopoverActionButtonText: "text-[#E0E0E0]",
                  userButtonPopoverFooter: "border-t border-[#2C2C2C]",
                },
              }}
            />
          </Show>

          {/* Subscribe / Live Alerts Button */}
          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#D32F2F] via-[#E64A19] to-[#FF9800] hover:opacity-95 rounded-md shadow-sm transition-all"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
              <span>Stay Vibe</span>
            </Link>
          </Show>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#9E9E9E] hover:text-white bg-[#1E1E1E] rounded-md border border-[#2C2C2C]"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#2C2C2C] space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-xs text-left rounded-md transition-colors ${
                    isActive
                      ? "bg-[#E64A19] text-white font-semibold"
                      : "bg-[#1E1E1E] text-[#9E9E9E] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Show when="signed-out">
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs text-left rounded-md bg-[#2C2C2C] text-[#FF9800] font-semibold col-span-2 text-center"
              >
                Sign In / Register
              </Link>
            </Show>
          </div>
        </div>
      )}
    </header>
  );
}