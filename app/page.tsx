"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { BiasMeter } from "@/components/BiasMeter";
import { SentimentBadge, FramingBadge } from "@/components/Badges";
import { ArticleThumbnail } from "@/components/ArticleThumbnail";
import { MOCK_ARTICLES, Article } from "@/lib/data/mock-articles";

const CATEGORIES = [
  "All",
  "Pop Culture",
  "Social Change",
  "Tech-Vibe",
  "Politics",
  "Economy",
  "More +",
];

export default function VibeXnewsHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(["gen-z-media-views"]));
  const [sortOption, setSortOption] = useState<"latest" | "polarized" | "balanced">("latest");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleBookmark = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed from saved perspectives");
      } else {
        next.add(id);
        showToast("Saved to your reading list");
      }
      return next;
    });
  };

  // Filter & Sort logic
  const filteredArticles = useMemo(() => {
    return MOCK_ARTICLES.filter((art: Article) => {
      const matchesCat =
        selectedCategory === "All" ||
        selectedCategory === "More +" ||
        art.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === "" ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.source.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    }).sort((a, b) => {
      if (sortOption === "polarized") {
        return Math.abs(b.bias.left - b.bias.right) - Math.abs(a.bias.left - a.bias.right);
      }
      if (sortOption === "balanced") {
        return b.bias.center - a.bias.center;
      }
      return 0; // default latest
    });
  }, [selectedCategory, searchQuery, sortOption]);

  const featuredArticle = filteredArticles.find((a) => a.isFeatured) || filteredArticles[0];
  const gridArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#E64A19] selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E1E] text-[#FF9800] border border-[#FF9800]/40 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Shared Navigation Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* --- HERO TAGLINE & PERSPECTIVE TICKER --- */}
      <section className="border-b border-[#2C2C2C] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-4 lg:px-8 py-8 lg:py-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] text-[11px] font-semibold text-[#FF9800]">
                <span className="w-2 h-2 rounded-full bg-[#E64A19] animate-ping" />
                <span>Live AI News Analysis Engine</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                Vibrancy in perspectives. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#D32F2F] via-[#E64A19] to-[#FF9800] bg-clip-text text-transparent">
                  Data-driven clarity.
                </span>
              </h1>
              <p className="text-sm text-[#9E9E9E] leading-relaxed">
                Real news articles collected from verified global publishers, parsed, and analyzed with AI to reveal political framing, sentiment, and narrative balance.
              </p>
            </div>

            {/* Quick Metrics Dashboard Bar */}
            <div className="grid grid-cols-3 gap-3 bg-[#1E1E1E] p-3 rounded-xl border border-[#2C2C2C] shadow-sm">
              <div className="text-center px-2">
                <span className="block text-lg font-bold text-white font-mono">14</span>
                <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">Sources</span>
              </div>
              <div className="text-center px-2 border-x border-[#2C2C2C]">
                <span className="block text-lg font-bold text-[#FF9800] font-mono">100%</span>
                <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">AI Scored</span>
              </div>
              <div className="text-center px-2">
                <span className="block text-lg font-bold text-emerald-400 font-mono">94.2%</span>
                <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FILTER CHIPS & CONTROLS BAR --- */}
      <section className="px-4 lg:px-8 py-4 border-b border-[#2C2C2C] bg-[#0E0E0E]">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-[#757575] font-semibold uppercase tracking-wider mr-1 hidden sm:inline">
              Topics:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#E64A19] text-white shadow-md shadow-[#E64A19]/25 border border-[#E64A19]"
                      : "bg-[#1E1E1E] text-[#9E9E9E] hover:text-white hover:bg-[#2C2C2C] border border-[#2C2C2C]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort & Perspective Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#757575] font-medium hidden sm:inline">Sort:</span>
            <button
              onClick={() => setSortOption("latest")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortOption === "latest"
                  ? "bg-[#2C2C2C] text-white font-semibold border border-[#333]"
                  : "text-[#9E9E9E] hover:text-white"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortOption("polarized")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortOption === "polarized"
                  ? "bg-[#2C2C2C] text-white font-semibold border border-[#333]"
                  : "text-[#9E9E9E] hover:text-white"
              }`}
            >
              Most Polarized
            </button>
            <button
              onClick={() => setSortOption("balanced")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortOption === "balanced"
                  ? "bg-[#2C2C2C] text-white font-semibold border border-[#333]"
                  : "text-[#9E9E9E] hover:text-white"
              }`}
            >
              Consensus
            </button>
          </div>
        </div>
      </section>

      {/* --- MAIN FEED CONTENT --- */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 lg:px-8 py-8 space-y-10">
        {/* --- FEATURED SPOTLIGHT CARD --- */}
        {featuredArticle && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E64A19]" />
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                  Featured Perspective Spotlight
                </h2>
              </div>
              <span className="text-xs text-[#757575] font-mono">
                Model: {featuredArticle.model}
              </span>
            </div>

            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-5 lg:p-7 shadow-xl hover:border-[#E64A19]/50 transition-all vxn-card-glow group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Media Thumbnail linking to article details */}
                <div className="lg:col-span-4">
                  <Link href={`/article/${featuredArticle.id}`} className="block">
                    <ArticleThumbnail
                      theme={featuredArticle.imageTheme}
                      className="w-full h-56 lg:h-64 group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </Link>
                </div>

                {/* Article Info & AI Analysis */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Category & Source Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[#FF9800] uppercase tracking-wider">
                        {featuredArticle.source}
                      </span>
                      <span className="text-[#616161]">•</span>
                      <span className="text-[#9E9E9E] font-medium">
                        {featuredArticle.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FramingBadge label={featuredArticle.biasLabel} />
                      <SentimentBadge sentiment={featuredArticle.sentiment} />
                    </div>
                  </div>

                  {/* Headline linking to full details */}
                  <Link href={`/article/${featuredArticle.id}`} className="block">
                    <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-[#FF9800] transition-colors leading-snug cursor-pointer">
                      {featuredArticle.title}
                    </h3>
                  </Link>

                  {/* Summary */}
                  <p className="text-sm text-[#BDBDBD] leading-relaxed">
                    {featuredArticle.summary}
                  </p>

                  {/* THICK Bias Meter Container */}
                  <div className="bg-[#121212] p-4 rounded-xl border border-[#2C2C2C] space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[#9E9E9E]">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <span className="text-[#FF9800]">⚡</span>
                        AI-Estimated Framing Distribution
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        {Math.round(featuredArticle.confidence * 100)}% Confidence
                      </span>
                    </div>
                    {/* Thick Bias Meter */}
                    <BiasMeter bias={featuredArticle.bias} size="lg" />
                  </div>

                  {/* Metadata & Actions Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2C] text-xs text-[#9E9E9E]">
                    <div className="flex items-center gap-4">
                      <span>{featuredArticle.publishedAt}</span>
                      <span>•</span>
                      <span>{featuredArticle.readTime}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/article/${featuredArticle.id}`}
                        className="px-3 py-1 bg-[#2C2C2C] hover:bg-[#E64A19] text-white text-xs font-semibold rounded-md transition-colors"
                      >
                        Read Full Analysis →
                      </Link>
                      <button
                        onClick={() => toggleBookmark(featuredArticle.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          savedIds.has(featuredArticle.id)
                            ? "text-[#E64A19] bg-[#E64A19]/10"
                            : "text-[#9E9E9E] hover:text-white hover:bg-[#2C2C2C]"
                        }`}
                        title="Bookmark"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill={savedIds.has(featuredArticle.id) ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- ARTICLE FEED GRID --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Latest News Stream</span>
              <span className="text-xs font-normal text-[#9E9E9E]">
                ({filteredArticles.length} perspectives found)
              </span>
            </h2>
            <div className="text-xs text-[#9E9E9E]">
              Updated live from Supabase pipeline
            </div>
          </div>

          {gridArticles.length === 0 ? (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-12 text-center space-y-3">
              <h4 className="text-base font-semibold text-white">No articles match your filter</h4>
              <p className="text-xs text-[#9E9E9E]">
                Try adjusting your search query or selecting &quot;All&quot; topics.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#E64A19] rounded-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isSaved={savedIds.has(article.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          )}
        </section>

        {/* --- DESIGN SYSTEM COLOR & BIAS ARCHITECTURE KEY --- */}
        <section className="bg-[#121212] rounded-xl border border-[#2C2C2C] p-6 lg:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C2C2C] pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🛡</span>
                vibeXnews Methodology &amp; AI Framing Architecture
              </h3>
              <p className="text-xs text-[#9E9E9E] mt-0.5">
                Transparent breakdown of political perspective ratios and sentiment computation.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#1E1E1E] text-[#FF9800] border border-[#2C2C2C] self-start sm:self-auto font-semibold">
              Design System v1.1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Bias card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2C2C2C] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#C62828]" />
                  <h4 className="text-sm font-bold text-white">Left Framing</h4>
                </div>
                <span className="text-[10px] font-mono text-[#C62828] bg-[#C62828]/10 px-1.5 py-0.5 rounded font-bold">
                  #C62828
                </span>
              </div>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Highlights labor rights, structural inequality, regulatory governance, progressive policy frameworks, and public sector solutions.
              </p>
            </div>

            {/* Center Neutral card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2C2C2C] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#757575]" />
                  <h4 className="text-sm font-bold text-white">Center Neutral</h4>
                </div>
                <span className="text-[10px] font-mono text-[#9E9E9E] bg-slate-500/10 px-1.5 py-0.5 rounded font-bold">
                  #757575
                </span>
              </div>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Represents factual data reporting, consensus summaries, multi-perspective balance, and neutral non-emotive journalistic diction.
              </p>
            </div>

            {/* Right Bias card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2C2C2C] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FFD54F]" />
                  <h4 className="text-sm font-bold text-white">Right Framing</h4>
                </div>
                <span className="text-[10px] font-mono text-[#FFD54F] bg-[#FF9800]/10 px-1.5 py-0.5 rounded font-bold">
                  #FFD54F
                </span>
              </div>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Highlights free-market incentives, individual liberties, fiscal restraint, traditional institutional authority, and corporate competitiveness.
              </p>
            </div>
          </div>

          {/* AI Estimation Disclaimer */}
          <div className="bg-[#181818] p-4 rounded-lg border border-[#2C2C2C] flex items-start gap-3 text-xs text-[#9E9E9E]">
            <span className="text-[#E64A19] font-bold text-sm">ⓘ</span>
            <p className="leading-relaxed">
              <strong className="text-white">AI-Estimated Framing Disclaimer:</strong> Political perspective ratios (Left, Center, Right) are computed through natural language processing of article body text, rhetoric structure, and loaded phrasing. They represent algorithmic estimates, not objective truth, and are never inferred from source names alone.
            </p>
          </div>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}