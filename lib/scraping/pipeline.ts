import "server-only";

import { getServiceSupabase } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { findExistingUrls, getSelectedActiveSources, writeScrapeLog } from "@/lib/supabase/queries/scraping";
import { fetchHtmlThroughOxylabs } from "./oxylabs";
import { extractHomepageCandidates, parseArticleDetail } from "./parsers";
import type { ScrapeRequest, ScrapeSummary } from "./types";

const DEFAULT_PER_SOURCE_LIMIT = 5;

function incrementReason(summary: ScrapeSummary, reason: string): void {
  summary.rejectionReasons[reason] = (summary.rejectionReasons[reason] ?? 0) + 1;
}

export async function runManualScrape(input: ScrapeRequest): Promise<ScrapeSummary> {
  const startedAt = Date.now();
  const summary: ScrapeSummary = {
    status: "completed", sourcesChecked: 0, candidatesFound: 0, candidatesRejected: 0, duplicatesSkipped: 0,
    detailPagesScraped: 0, articlesInserted: 0, articlesRejected: 0, articlesFailed: 0, durationMs: 0, rejectionReasons: {},
  };
  const supabase = getServiceSupabase() as unknown as SupabaseClient;
  await writeScrapeLog(supabase, "started", "Manual scrape started");

  try {
    const sources = await getSelectedActiveSources(supabase, input.sourceIds);
    const perSourceLimit = input.perSourceLimit ?? DEFAULT_PER_SOURCE_LIMIT;
    console.info("[scrape] started", { sources: sources.map((source) => source.name), perSourceLimit });

    for (const source of sources) {
      summary.sourcesChecked += 1;
      console.info("[scrape] source started", { source: source.name });
      try {
        const homepageHtml = await fetchHtmlThroughOxylabs(source.listing_url);
        console.info("[scrape] homepage fetched", { source: source.name });
        const extraction = extractHomepageCandidates(homepageHtml, source.name, source.listing_url);
        summary.candidatesFound += extraction.candidates.length;
        summary.candidatesRejected += extraction.rejected;
        if (extraction.rejected) incrementReason(summary, "non_article_or_invalid_candidate");
        console.info("[scrape] homepage candidates", { source: source.name, found: extraction.candidates.length, rejected: extraction.rejected });

        const existingUrls = await findExistingUrls(supabase, extraction.candidates.map((candidate) => candidate.url));
        const candidates = extraction.candidates.filter((candidate) => {
          const duplicate = existingUrls.has(candidate.url);
          if (duplicate) summary.duplicatesSkipped += 1;
          return !duplicate;
        }).slice(0, perSourceLimit);
        console.info("[scrape] candidates after dedupe", { source: source.name, remaining: candidates.length });

        for (const candidate of candidates) {
          try {
            const detailHtml = await fetchHtmlThroughOxylabs(candidate.url);
            summary.detailPagesScraped += 1;
            const parsed = parseArticleDetail(detailHtml, candidate.url, source.name);
            if (!parsed.article) {
              summary.articlesRejected += 1;
              incrementReason(summary, parsed.reason ?? "article_validation_failed");
              continue;
            }

            const canonicalUrl = parsed.article.canonicalUrl;
            if (canonicalUrl && (await findExistingUrls(supabase, [canonicalUrl])).has(canonicalUrl)) {
              summary.duplicatesSkipped += 1;
              continue;
            }

            const { error } = await supabase.from("articles").insert({
              source_id: source.id,
              original_url: candidate.url,
              canonical_url: parsed.article.canonicalUrl,
              title: parsed.article.title,
              image_url: parsed.article.imageUrl,
              published_at: parsed.article.publishedAt,
              raw_text: parsed.article.rawText,
              category: parsed.article.category,
            });
            if (error) {
              if (error.code === "23505") {
                summary.duplicatesSkipped += 1;
                continue;
              }
              throw new Error(`Article insert failed: ${error.message}`);
            }
            summary.articlesInserted += 1;
            console.info("[scrape] article inserted", { source: source.name, url: candidate.url });
          } catch (error) {
            summary.articlesFailed += 1;
            incrementReason(summary, "detail_scrape_failed");
            console.error("[scrape] detail page failed", { source: source.name, message: error instanceof Error ? error.message : "unknown error" });
          }
        }
      } catch (error) {
        summary.articlesFailed += 1;
        incrementReason(summary, "source_scrape_failed");
        console.error("[scrape] source failed", { source: source.name, message: error instanceof Error ? error.message : "unknown error" });
      }
    }
  } catch (error) {
    summary.status = "failed";
    incrementReason(summary, "run_initialization_failed");
    console.error("[scrape] run failed", error instanceof Error ? error.message : "unknown error");
  }

  summary.durationMs = Date.now() - startedAt;
  console.info("[scrape] completed", summary);
  await writeScrapeLog(supabase, summary.status === "completed" ? "completed" : "failed", "Manual scrape completed", summary);
  return summary;
}



