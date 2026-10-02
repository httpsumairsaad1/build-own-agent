import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "@/lib/supabase/server";
import { getPendingArticles, writeAnalysisLog } from "@/lib/supabase/queries/analysis";
import { analyzeArticle } from "./analyze-article";

const DEFAULT_BATCH_SIZE = 5;
const MINIMUM_ANALYZABLE_TEXT_LENGTH = 200;

export type AnalysisRequest = {
  articleIds?: string[];
  limit?: number;
};

export type AnalysisSummary = {
  status: "completed" | "failed";
  articlesConsidered: number;
  analyzed: number;
  skipped: number;
  failed: number;
  batches: number;
  durationMs: number;
  reasons: Record<string, number>;
};

function getBatchSize(): number {
  const configured = Number.parseInt(process.env.ANALYSIS_BATCH_SIZE ?? "", 10);
  return Number.isInteger(configured) && configured > 0 && configured <= 20 ? configured : DEFAULT_BATCH_SIZE;
}

function incrementReason(summary: AnalysisSummary, reason: string): void {
  summary.reasons[reason] = (summary.reasons[reason] ?? 0) + 1;
}

async function analyzeWithRetry(article: { title: string; rawText: string }) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await analyzeArticle(article);
    } catch (error) {
      lastError = error;
      console.warn("[analysis] model attempt failed", { attempt, message: error instanceof Error ? error.message : "unknown error" });
    }
  }
  throw lastError instanceof Error ? lastError : new Error("AI analysis failed after retry.");
}

export async function runAnalysis(input: AnalysisRequest): Promise<AnalysisSummary> {
  const startedAt = Date.now();
  const summary: AnalysisSummary = {
    status: "completed", articlesConsidered: 0, analyzed: 0, skipped: 0, failed: 0, batches: 0, durationMs: 0, reasons: {},
  };
  const supabase = getServiceSupabase() as unknown as SupabaseClient;
  await writeAnalysisLog(supabase, "started", "AI analysis started");

  try {
    const pending = await getPendingArticles(supabase, input.articleIds, input.limit);
    summary.articlesConsidered = pending.length;
    const batchSize = getBatchSize();
    console.info("[analysis] started", { pending: pending.length, batchSize });

    for (let offset = 0; offset < pending.length; offset += batchSize) {
      const batch = pending.slice(offset, offset + batchSize);
      summary.batches += 1;
      let batchAnalyzed = 0;
      let batchSkipped = 0;
      let batchFailed = 0;

      for (const article of batch) {
        if (!article.raw_text || article.raw_text.trim().length < MINIMUM_ANALYZABLE_TEXT_LENGTH) {
          summary.skipped += 1;
          batchSkipped += 1;
          incrementReason(summary, "insufficient_raw_text");
          continue;
        }

        try {
          const result = await analyzeWithRetry({ title: article.title, rawText: article.raw_text });
          const { error: insertError } = await supabase.from("article_analyses").insert({
            article_id: article.id,
            summary: result.analysis.summary,
            sentiment_score: result.analysis.sentimentScore,
            sentiment_label: result.analysis.sentimentLabel,
            bias_score: (result.analysis.rightPercentage - result.analysis.leftPercentage) / 100,
            bias_label: result.analysis.politicalFramingLabel,
            left_percentage: result.analysis.leftPercentage,
            center_percentage: result.analysis.centerPercentage,
            right_percentage: result.analysis.rightPercentage,
            confidence: result.analysis.confidence,
            framing_notes: result.analysis.framingNotes,
            loaded_terms: result.analysis.loadedTerms,
            disclaimer: result.analysis.disclaimer,
            model: result.model,
            embedding: result.embedding,
          });
          if (insertError) {
            if (insertError.code === "23505") {
              summary.skipped += 1;
              batchSkipped += 1;
              incrementReason(summary, "analysis_already_exists");
              continue;
            }
            throw new Error(`Analysis insert failed: ${insertError.message}`);
          }

          const categoryToSave = result.analysis.category || article.category || "Politics";
          const { error: updateError } = await supabase
            .from("articles")
            .update({
              analyzed_at: new Date().toISOString(),
              category: categoryToSave,
            })
            .eq("id", article.id);
          if (updateError) throw new Error(`Unable to mark article analyzed: ${updateError.message}`);

          summary.analyzed += 1;
          batchAnalyzed += 1;
          console.info("[analysis] article analyzed", { articleId: article.id });
        } catch (error) {
          summary.failed += 1;
          batchFailed += 1;
          incrementReason(summary, "analysis_failed");
          console.error("[analysis] article failed", { articleId: article.id, message: error instanceof Error ? error.message : "unknown error" });
        }
      }

      console.info("[analysis] batch completed", { batch: summary.batches, analyzed: batchAnalyzed, skipped: batchSkipped, failed: batchFailed });
    }
  } catch (error) {
    summary.status = "failed";
    incrementReason(summary, "pipeline_initialization_failed");
    console.error("[analysis] pipeline failed", error instanceof Error ? error.message : "unknown error");
  }

  summary.durationMs = Date.now() - startedAt;
  console.info("[analysis] completed", summary);
  await writeAnalysisLog(supabase, summary.status === "completed" ? "completed" : "failed", "AI analysis completed", summary);
  return summary;
}
