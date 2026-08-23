import React from "react";
import { Article } from "@/lib/data/mock-articles";

interface ArticleThumbnailProps {
  theme: Article["imageTheme"];
  className?: string;
}

export function ArticleThumbnail({
  theme,
  className = "w-full h-44",
}: ArticleThumbnailProps) {
  const gradients = {
    politics: "from-[#2C1810] via-[#1E1E1E] to-[#121212]",
    tech: "from-[#101E2C] via-[#1E1E1E] to-[#121212]",
    social: "from-[#2C101C] via-[#1E1E1E] to-[#121212]",
    economy: "from-[#252C10] via-[#1E1E1E] to-[#121212]",
    climate: "from-[#102C26] via-[#1E1E1E] to-[#121212]",
    culture: "from-[#2A102C] via-[#1E1E1E] to-[#121212]",
  };

  const accentColors = {
    politics: "#E64A19",
    tech: "#0288D1",
    social: "#D32F2F",
    economy: "#FF9800",
    climate: "#00897B",
    culture: "#AB47BC",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${gradients[theme]} border border-[#2C2C2C] flex items-center justify-center ${className}`}
    >
      {/* Decorative Grid Lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #404040 1px, transparent 1px), linear-gradient(to bottom, #404040 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Abstract Editorial Silhouette & Data Visual */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
        {/* Subtle circular data radar */}
        <div className="relative w-14 h-14 rounded-full border border-[#444] flex items-center justify-center mb-1.5 shadow-inner">
          <div
            className="w-8 h-8 rounded-full opacity-35 animate-pulse"
            style={{ backgroundColor: accentColors[theme] }}
          />
          <div
            className="absolute inset-0 rounded-full border border-dashed opacity-50 animate-spin"
            style={{
              borderColor: accentColors[theme],
              animationDuration: "20s",
            }}
          />
          <svg
            className="w-4 h-4 text-white/90 z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <span className="text-[10px] uppercase font-mono tracking-wider text-[#9E9E9E]">
          AI Perspective Stream
        </span>
      </div>

      {/* Corner Glow */}
      <div
        className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-25"
        style={{ backgroundColor: accentColors[theme] }}
      />
    </div>
  );
}
