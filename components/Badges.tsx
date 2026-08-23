import React from "react";
import { Sentiment, Article } from "@/lib/data/mock-articles";

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const isPositive = sentiment.score > 0.15;
  const isNegative = sentiment.score < -0.15;

  const bgStyle = isPositive
    ? "bg-[#1E2E1E] text-[#66BB6A] border-[#2E7D32]/40"
    : isNegative
    ? "bg-[#2E1A1A] text-[#EF5350] border-[#C62828]/40"
    : "bg-[#1E1E1E] text-[#B0BEC5] border-[#455A64]/40";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${bgStyle}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPositive
            ? "bg-[#66BB6A]"
            : isNegative
            ? "bg-[#EF5350]"
            : "bg-[#B0BEC5]"
        }`}
      />
      {sentiment.label}{" "}
      <span className="opacity-70 font-mono text-[10px]">
        ({sentiment.score >= 0 ? `+${sentiment.score.toFixed(2)}` : sentiment.score.toFixed(2)})
      </span>
    </span>
  );
}

export function FramingBadge({ label }: { label: Article["biasLabel"] }) {
  const styles = {
    Left: "bg-[#C62828]/15 text-[#EF5350] border-[#C62828]/40",
    Center: "bg-[#757575]/15 text-[#E0E0E0] border-[#757575]/40",
    Right: "bg-[#FFD54F]/15 text-[#FFD54F] border-[#FFD54F]/40",
    Mixed: "bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/40",
    Unclear: "bg-[#424242]/15 text-[#9E9E9E] border-[#424242]/40",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[label]}`}
    >
      {label} Bias
    </span>
  );
}
