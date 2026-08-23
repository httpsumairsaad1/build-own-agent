import React from "react";
import Link from "next/link";
import { Article } from "@/lib/data/mock-articles";
import { BiasMeter } from "./BiasMeter";
import { SentimentBadge, FramingBadge } from "./Badges";
import { ArticleThumbnail } from "./ArticleThumbnail";

interface ArticleCardProps {
  article: Article;
  isSaved?: boolean;
  onToggleBookmark?: (id: string) => void;
}

export function ArticleCard({
  article,
  isSaved = false,
  onToggleBookmark,
}: ArticleCardProps) {
  return (
    <article className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-4 flex flex-col justify-between space-y-4 vxn-card-glow shadow-md hover:border-[#E64A19]/50 transition-all group">
      <div className="space-y-3">
        {/* Clickable Image Preview */}
        <Link href={`/article/${article.id}`} className="block overflow-hidden rounded-lg">
          <ArticleThumbnail
            theme={article.imageTheme}
            className="w-full h-36 group-hover:scale-[1.02] transition-transform duration-300"
          />
        </Link>

        {/* Header: Source & Badges */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-[#FF9800] font-semibold">{article.source}</span>
            <span className="text-[#616161]">•</span>
            <span className="text-[#9E9E9E]">{article.category}</span>
          </div>
          <FramingBadge label={article.biasLabel} />
        </div>

        {/* Headline linking to details */}
        <Link href={`/article/${article.id}`} className="block">
          <h4 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-[#FF9800] transition-colors cursor-pointer">
            {article.title}
          </h4>
        </Link>

        {/* Summary Snippet */}
        <p className="text-xs text-[#9E9E9E] line-clamp-3 leading-relaxed">
          {article.summary}
        </p>
      </div>

      {/* Footer analysis and THICK meter */}
      <div className="space-y-3 pt-3 border-t border-[#2C2C2C]">
        {/* Sentiment readout */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#757575] font-semibold">
            Sentiment:
          </span>
          <SentimentBadge sentiment={article.sentiment} />
        </div>

        {/* Thick Bias Meter */}
        <BiasMeter bias={article.bias} size="md" />

        {/* Metadata & Actions */}
        <div className="flex items-center justify-between text-[11px] text-[#757575] pt-1">
          <span className="flex items-center gap-1">
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {article.publishedAt}
          </span>

          <div className="flex items-center gap-2">
            <span className="font-mono">{article.readTime}</span>
            {onToggleBookmark && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleBookmark(article.id);
                }}
                className={`p-1 rounded hover:bg-[#2C2C2C] transition-colors ${
                  isSaved ? "text-[#E64A19]" : "text-[#757575] hover:text-white"
                }`}
                title={isSaved ? "Saved" : "Save perspective"}
                aria-label="Bookmark"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill={isSaved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
