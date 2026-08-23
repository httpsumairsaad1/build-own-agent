"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleById, getRelatedArticles } from "@/lib/data/mock-articles";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BiasMeter } from "@/components/BiasMeter";
import { SentimentBadge, FramingBadge } from "@/components/Badges";
import { ArticleThumbnail } from "@/components/ArticleThumbnail";
import { ArticleCard } from "@/components/ArticleCard";

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = use(params);
  const article = getArticleById(id);

  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!article) {
    return notFound();
  }

  const relatedArticles = getRelatedArticles(article.id, article.category, 3);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Perspective link copied to clipboard");
    }
  };

  const handleToggleBookmark = () => {
    setIsSaved(!isSaved);
    showToast(isSaved ? "Removed from saved perspectives" : "Saved to your reading list");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#E64A19] selection:text-white">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E1E] text-[#FF9800] border border-[#FF9800]/40 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
          <span className="text-[#FF9800]">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Shared Header */}
      <Header />

      {/* Main Reading Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 lg:px-8 py-8 space-y-10">
        {/* Back Link & Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[#9E9E9E]">
          <Link
            href={`/${article.category.toLowerCase().replace(" ", "-")}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to {article.category}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span>Model:</span>
            <span className="font-mono text-[#FF9800] bg-[#1E1E1E] px-2 py-0.5 rounded border border-[#2C2C2C]">
              {article.model}
            </span>
          </div>
        </div>

        {/* Article Header & Badges */}
        <header className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold text-[#FF9800] uppercase tracking-wider text-xs">
              {article.source}
            </span>
            <span className="text-[#616161]">•</span>
            <span className="text-xs text-[#9E9E9E] font-medium">{article.category}</span>
            <span className="text-[#616161]">•</span>
            <FramingBadge label={article.biasLabel} />
            <SentimentBadge sentiment={article.sentiment} />
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#2C2C2C] text-xs text-[#9E9E9E]">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">{article.author}</span>
              <span>•</span>
              <span>{article.publishedAt}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-md transition-colors border border-[#2C2C2C] ${
                  isSaved
                    ? "bg-[#E64A19]/20 text-[#E64A19] border-[#E64A19]/50"
                    : "bg-[#1E1E1E] text-[#9E9E9E] hover:text-white"
                }`}
                title={isSaved ? "Saved" : "Save article"}
              >
                <svg
                  className="w-4 h-4"
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
              <button
                onClick={handleShare}
                className="p-2 rounded-md bg-[#1E1E1E] text-[#9E9E9E] hover:text-white transition-colors border border-[#2C2C2C]"
                title="Share article"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#1E1E1E] text-xs font-semibold text-[#FF9800] hover:bg-[#2C2C2C] border border-[#2C2C2C] transition-colors"
                >
                  <span>Original Source</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          </div>
        </header>

        {/* 2-Column Content Grid: Story Body + AI Analysis Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Editorial Thumbnail */}
            <ArticleThumbnail
              theme={article.imageTheme}
              className="w-full h-72 lg:h-80 rounded-xl"
            />

            {/* Key Takeaways Box */}
            {article.keyTakeaways && article.keyTakeaways.length > 0 && (
              <div className="bg-[#181818] p-5 rounded-xl border border-[#2C2C2C] space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF9800] flex items-center gap-1.5">
                  <span>⚡</span> Key Perspective Takeaways
                </h3>
                <ul className="space-y-2 text-sm text-[#D0D0D0]">
                  {article.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#E64A19] font-bold">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Story Paragraphs */}
            <div className="space-y-4 text-base text-[#D4D4D4] leading-relaxed font-normal pt-2">
              {article.fullText.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Sticky AI Perspective & Framing Sidebar */}
          <aside className="lg:col-span-5 space-y-6 sticky top-20">
            {/* AI Analysis Card */}
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E64A19] animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    AI Perspective Analysis
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  {Math.round(article.confidence * 100)}% Confidence
                </span>
              </div>

              {/* Neutral Summary */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E9E]">
                  Neutral Executive Summary
                </span>
                <p className="text-xs text-[#E0E0E0] bg-[#141414] p-3.5 rounded-lg border border-[#2C2C2C] leading-relaxed">
                  {article.summary}
                </p>
              </div>

              {/* Thick 3-Way Bias Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E9E]">
                    Framing Distribution
                  </span>
                  <span className="text-[11px] font-mono text-[#9E9E9E]">
                    Bias Score:{" "}
                    <strong className="text-white">
                      {article.derivedBiasScore >= 0
                        ? `+${article.derivedBiasScore.toFixed(2)}`
                        : article.derivedBiasScore.toFixed(2)}
                    </strong>
                  </span>
                </div>
                <div className="bg-[#121212] p-4 rounded-xl border border-[#2C2C2C]">
                  <BiasMeter bias={article.bias} size="lg" />
                </div>
              </div>

              {/* Framing Notes */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E9E]">
                  Framing &amp; Rhetorical Analysis
                </span>
                <p className="text-xs text-[#BDBDBD] bg-[#141414] p-3.5 rounded-lg border border-[#2C2C2C] leading-relaxed">
                  {article.framingNotes}
                </p>
              </div>

              {/* Detected Loaded Terms */}
              {article.loadedTerms && article.loadedTerms.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E9E]">
                      Detected Loaded Diction ({article.loadedTerms.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {article.loadedTerms.map((term, i) => (
                      <div
                        key={i}
                        className="bg-[#141414] p-2.5 rounded-lg border border-[#2C2C2C] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[#FF9800] font-semibold">
                            &quot;{term.term}&quot;
                          </span>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                              term.biasWeight === "left"
                                ? "bg-[#C62828]/20 text-[#EF5350]"
                                : term.biasWeight === "right"
                                ? "bg-[#FFD54F]/20 text-[#FFD54F]"
                                : "bg-purple-500/20 text-purple-300"
                            }`}
                          >
                            {term.biasWeight} nuance
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9E9E9E]">{term.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-[#121212] p-3.5 rounded-lg border border-[#2C2C2C] flex items-start gap-2.5 text-[11px] text-[#757575] leading-relaxed">
                <span className="text-[#E64A19] font-bold">ⓘ</span>
                <span>{article.disclaimer}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="space-y-4 pt-10 border-t border-[#2C2C2C]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Related Perspectives</span>
                <span className="text-xs font-normal text-[#9E9E9E]">
                  (In {article.category})
                </span>
              </h2>
              <Link
                href={`/${article.category.toLowerCase().replace(" ", "-")}`}
                className="text-xs text-[#FF9800] hover:underline"
              >
                View all in {article.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
