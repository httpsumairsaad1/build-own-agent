import { supabase } from "../client";
import type { JoinedArticleRow } from "../types";
import type { Article } from "@/lib/data/mock-articles";

/**
 * Format database timestamp into relative readable string (e.g. "2 hours ago" or "Sep 24, 2026").
 */
function formatPublishedTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

/**
 * Estimate read time from text.
 */
function calculateReadTime(text: string | null): string {
  if (!text) return "4 min read";
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${Math.max(2, minutes)} min read`;
}

/**
 * Determine image theme fallback from category.
 */
function mapCategoryToTheme(cat: string | null): Article["imageTheme"] {
  const c = (cat || "").toLowerCase();
  if (c.includes("tech")) return "tech";
  if (c.includes("social")) return "social";
  if (c.includes("econ")) return "economy";
  if (c.includes("pop") || c.includes("culture")) return "culture";
  return "politics";
}

/**
 * Convert a Supabase joined row (articles + sources + article_analyses) to UI Article domain object.
 */
export function mapSupabaseToArticle(row: JoinedArticleRow): Article {
  const analysis = row.article_analyses;
  const source = row.sources;

  const biasLabelMap: Record<string, Article["biasLabel"]> = {
    left: "Left",
    center: "Center",
    right: "Right",
    mixed: "Mixed",
    unclear: "Unclear",
  };

  const sentimentLabelMap: Record<string, "Positive" | "Neutral" | "Negative"> = {
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
  };

  const fullTextParagraphs = row.raw_text
    ? row.raw_text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [analysis?.summary || row.title];

  let parsedLoadedTerms: Article["loadedTerms"] = [];
  if (analysis?.loaded_terms && Array.isArray(analysis.loaded_terms)) {
    parsedLoadedTerms = analysis.loaded_terms as unknown as Article["loadedTerms"];
  }

  const category = (row.category || "Politics") as Article["category"];

  return {
    id: row.id,
    source: source?.name || "News Wire",
    sourceUrl: row.original_url || source?.listing_url || undefined,
    category,
    title: row.title,
    summary: analysis?.summary || row.title,
    fullText: fullTextParagraphs,
    keyTakeaways: analysis?.framing_notes
      ? [analysis.framing_notes]
      : ["AI perspectives evaluated against multi-outlet framing indicators."],
    publishedAt: formatPublishedTime(row.published_at),
    readTime: calculateReadTime(row.raw_text),
    author: `${source?.name || "Editorial"} Staff`,
    imageTheme: mapCategoryToTheme(row.category),
    bias: {
      left: analysis?.left_percentage ?? 15,
      center: analysis?.center_percentage ?? 70,
      right: analysis?.right_percentage ?? 15,
    },
    biasLabel: biasLabelMap[analysis?.bias_label || "center"] || "Center",
    derivedBiasScore: analysis?.bias_score ?? 0,
    sentiment: {
      label: sentimentLabelMap[analysis?.sentiment_label || "neutral"] || "Neutral",
      score: analysis?.sentiment_score ?? 0,
    },
    confidence: analysis?.confidence ?? 0.85,
    framingNotes:
      analysis?.framing_notes ||
      "Perspective framed through objective reporting with neutral vocabulary metrics.",
    loadedTerms: parsedLoadedTerms,
    model: analysis?.model || "AI Model",
    disclaimer:
      analysis?.disclaimer ||
      "AI-Estimated framing scores evaluate linguistic syntax, perspective distribution, and framing balance.",
    isFeatured: false,
  };
}

/**
 * Fetch articles from Supabase with joined sources and analyses.
 * Returns an empty array when no analyzed articles exist — no mock fallback.
 */
export async function getArticles(category?: string, limit?: number): Promise<Article[]> {
  try {
    let query = supabase
      .from("articles")
      .select("*, sources(*), article_analyses(*)");

    if (category && category.toLowerCase() !== "all" && category.toLowerCase() !== "more +") {
      query = query.ilike("category", `%${category}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query
      .not("analyzed_at", "is", null)
      .order("published_at", { ascending: false });

    if (error) {
      console.warn("Supabase getArticles query error:", error.message);
      return [];
    }

    const rows = (data || []) as unknown as JoinedArticleRow[];
    if (rows.length === 0) {
      return [];
    }

    const mapped = rows
      .filter((row) => row.article_analyses !== null)
      .map(mapSupabaseToArticle);

    // Mark the first article as featured
    if (mapped.length > 0) {
      mapped[0].isFeatured = true;
    }

    return mapped;
  } catch (err) {
    console.warn("getArticles error:", err);
    return [];
  }
}

/**
 * Fetch a single article by ID with joined source and analysis.
 * Returns null when not found — no mock fallback.
 */
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*, sources(*), article_analyses(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.warn("Supabase getArticleById error:", error.message);
      return null;
    }

    if (!data) return null;

    return mapSupabaseToArticle(data as unknown as JoinedArticleRow);
  } catch (err) {
    console.warn("Supabase getArticleById error:", err);
    return null;
  }
}

/**
 * Fetch related articles by category, excluding the current article.
 */
export async function getRelatedArticles(
  currentId: string,
  category: string,
  limit: number = 3
): Promise<Article[]> {
  try {
    const all = await getArticles(category, limit + 2);
    return all.filter((a) => a.id !== currentId).slice(0, limit);
  } catch (err) {
    console.warn("getRelatedArticles error:", err);
    return [];
  }
}

/**
 * Fetch articles by category.
 */
export async function getArticlesByCategory(
  category: Article["category"],
  limit?: number
): Promise<Article[]> {
  return getArticles(category, limit);
}

/**
 * Fetch aggregate metrics for the dashboard header (source count, article count, avg confidence).
 */
export async function getDashboardMetrics(): Promise<{
  sourceCount: number;
  articleCount: number;
  avgConfidence: number;
}> {
  try {
    const [sourcesRes, analysesRes] = await Promise.all([
      supabase.from("sources").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("article_analyses").select("confidence"),
    ]);

    const sourceCount = sourcesRes.count ?? 0;
    const analyses = analysesRes.data ?? [];
    const articleCount = analyses.length;
    const avgConfidence =
      articleCount > 0
        ? analyses.reduce((sum: number, r: { confidence: number }) => sum + (r.confidence ?? 0), 0) / articleCount
        : 0;

    return { sourceCount, articleCount, avgConfidence };
  } catch (err) {
    console.warn("getDashboardMetrics error:", err);
    return { sourceCount: 0, articleCount: 0, avgConfidence: 0 };
  }
}
