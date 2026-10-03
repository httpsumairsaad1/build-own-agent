import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type PendingArticle = {
  id: string;
  title: string;
  raw_text: string | null;
  category: string | null;
  article_analyses: { id: string } | { id: string }[] | null;
};

export async function getPendingArticles(
  supabase: SupabaseClient,
  articleIds?: string[],
  limit?: number
): Promise<PendingArticle[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, raw_text, category, article_analyses(id)")
    .order("scraped_at", { ascending: true });

  if (error) throw new Error(`Unable to load pending articles: ${error.message}`);

  const selectedIds = articleIds?.length ? new Set(articleIds) : null;
  const pending = ((data ?? []) as unknown as PendingArticle[]).filter((article) => {
    const analyses = Array.isArray(article.article_analyses)
      ? article.article_analyses
      : article.article_analyses
        ? [article.article_analyses]
        : [];
    return analyses.length === 0 && (!selectedIds || selectedIds.has(article.id));
  });

  return limit === undefined ? pending : pending.slice(0, limit);
}

export async function writeAnalysisLog(
  supabase: SupabaseClient,
  status: "started" | "completed" | "failed",
  message: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from("logs").insert({
    run_type: "ai_analysis",
    status,
    message,
    details: details ?? null,
  });
  if (error) console.error("[analysis] failed to write run log", error.message);
}
