"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { Article } from "@/lib/data/mock-articles";
import { getArticlesByCategory } from "@/lib/supabase/queries/articles";

export default function TechVibePage() {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"latest" | "polarized" | "balanced">("latest");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const data = await getArticlesByCategory("Tech-Vibe");
      if (isMounted) {
        setArticlesList(data);
        setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const articles = useMemo(() => {
    return articlesList
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
  }, [articlesList, searchQuery, sortOption]);

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
      <section className="border-b border-[#2C2C2C] bg-gradient-to-b from-[#101E2C] to-[#0A0A0A] px-4 lg:px-8 py-8 lg:py-10">
        <div className="max-w-[1280px] mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] text-[11px] font-semibold text-[#0288D1]">
            <span className="w-2 h-2 rounded-full bg-[#0288D1]" />
            <span>Category Feed</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Tech-Vibe &amp; Frontier Innovation
          </h1>
          <p className="text-sm text-[#9E9E9E] max-w-2xl leading-relaxed">
            Exploration of artificial intelligence, semiconductor hardware, clean energy, space exploration, and cyber-security architectures analyzed across diverse media viewpoints.
          </p>
        </div>
      </section>

      {/* Filter & Controls */}
      <section className="px-4 lg:px-8 py-3 border-b border-[#2C2C2C] bg-[#0E0E0E]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <span className="text-xs text-[#9E9E9E]">
            Showing <strong className="text-white">{articles.length}</strong> tech perspectives
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
        {isLoading ? (
          <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#E64A19] border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-[#9E9E9E]">Loading tech perspectives...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2C2C2C] flex items-center justify-center mx-auto text-2xl">
              📡
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-white">Awaiting first pipeline run</h4>
              <p className="text-xs text-[#9E9E9E] max-w-sm mx-auto">
                No analyzed Tech articles in Supabase yet. Run the scraping and analysis pipeline to populate this category.
              </p>
            </div>
          </div>
        ) : (
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
        )}
      </main>

      <Footer />
    </div>
  );
}
