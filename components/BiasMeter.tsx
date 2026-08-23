import React from "react";
import { BiasBreakdown } from "@/lib/data/mock-articles";

interface BiasMeterProps {
  bias: BiasBreakdown;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BiasMeter({
  bias,
  showLabels = true,
  size = "md",
}: BiasMeterProps) {
  // Thicker bar heights: sm = 12px (h-3), md = 16px (h-4), lg = 24px (h-6)
  const barHeight =
    size === "sm" ? "h-3" : size === "lg" ? "h-6" : "h-4";

  return (
    <div className="w-full space-y-2">
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-semibold tracking-tight">
          {/* Left indicator */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C62828] shadow-sm shadow-[#C62828]/50" />
            <span className="text-[#C62828] font-bold">Left {bias.left}%</span>
          </div>

          {/* Center indicator */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#757575]" />
            <span className="text-[#9E9E9E] font-medium">Center {bias.center}%</span>
          </div>

          {/* Right indicator */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FFD54F] shadow-sm shadow-[#FF9800]/50" />
            <span className="text-[#FFD54F] font-bold">Right {bias.right}%</span>
          </div>
        </div>
      )}

      {/* Prominent, Thick Segmented Bar */}
      <div
        className={`w-full ${barHeight} rounded-full bg-[#121212] overflow-hidden flex p-0.5 border-2 border-[#2C2C2C] shadow-inner gap-0.5`}
      >
        {/* Left Segment */}
        <div
          style={{ width: `${bias.left}%` }}
          className="h-full bg-gradient-to-r from-[#B71C1C] to-[#C62828] rounded-l-full transition-all duration-500 flex items-center justify-center overflow-hidden"
          title={`Left Framing: ${bias.left}%`}
        >
          {size === "lg" && bias.left >= 15 && (
            <span className="text-[10px] font-bold text-white tracking-tight drop-shadow">
              {bias.left}%
            </span>
          )}
        </div>

        {/* Center Segment */}
        <div
          style={{ width: `${bias.center}%` }}
          className="h-full bg-gradient-to-r from-[#5A5A5A] to-[#757575] transition-all duration-500 flex items-center justify-center overflow-hidden"
          title={`Center Neutral: ${bias.center}%`}
        >
          {size === "lg" && bias.center >= 20 && (
            <span className="text-[10px] font-bold text-white tracking-tight drop-shadow">
              {bias.center}%
            </span>
          )}
        </div>

        {/* Right Segment */}
        <div
          style={{ width: `${bias.right}%` }}
          className="h-full bg-gradient-to-r from-[#FFB300] to-[#FFD54F] rounded-r-full transition-all duration-500 flex items-center justify-center overflow-hidden"
          title={`Right Framing: ${bias.right}%`}
        >
          {size === "lg" && bias.right >= 15 && (
            <span className="text-[10px] font-bold text-black tracking-tight drop-shadow">
              {bias.right}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
