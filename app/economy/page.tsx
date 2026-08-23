"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticlesByCategory } from "@/lib/data/mock-articles";

export default function EconomyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"latest" | "polarized" | "balanced">("latest");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const articles = useMemo(() => {
    return getArticlesByCategory("Economy")
      .filter((art) => {
        return (
          searchQuery.trim() === "" ||
          art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.source.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => {
        if (sortOption === "polarized") {
          return Math.abs(b.bias.left - b.bias.right) - Math.abs(a.bias.left - a.bias.right);
        }
        if (sortOption === "balanced") {
          return b.bias.center - a.bias.center;
        }
        return 0;
      });
  }, [searchQuery, sortOption]);

  const toggleBookmark = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#E64A19] selection:text-white">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Topic Hero */}
      <section className="border-b border-[#2C2C2C] bg-gradient-to-b from-[#252C10] to-[#0A0A0A] px-4 lg:px-8 py-8 lg:py-10">
        <div className="max-w-[1280px] mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] text-[11px] font-semibold text-[#FF9800]">
            <span className="w-2 h-2 rounded-full bg-[#FF9800]" />
            <span>Category Feed</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Economy, Markets &amp; Trade
          </h1>
          <p className="text-sm text-[#9E9E9E] max-w-2xl leading-relaxed">
            Data-driven macroeconomic coverage analyzing inflation, monetary policy, global trade re-alignments, corporate performance, and labor market indices.
          </p>
        </div>
      </section>

      {/* Filter & Controls */}
      <section className="px-4 lg:px-8 py-3 border-b border-[#2C2C2C] bg-[#0E0E0E]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <span className="text-xs text-[#9E9E9E]">
            Showing <strong className="text-white">{articles.length}</strong> economic perspectives
          </span>

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

      {/* Grid */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard
              key={art.id}
              article={art}
              isSaved={savedIds.has(art.id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
