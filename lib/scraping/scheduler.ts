import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "@/lib/supabase/server";
import { findExistingUrls, writeScrapeLog } from "@/lib/supabase/queries/scraping";
import { fetchHtmlThroughOxylabs } from "./oxylabs";
import { extractHomepageCandidates, parseArticleDetail } from "./parsers";
import type { ScrapeSummary } from "./types";
import type { SourceRow } from "@/lib/supabase/types";

const OXYLABS_SCHEDULES_ENDPOINT = "https://data.oxylabs.io/v1/schedules";
const OXYLABS_QUERIES_ENDPOINT = "https://data.oxylabs.io/v1/queries";
const DEFAULT_PER_SOURCE_LIMIT = 5;

function getOxylabsAuthHeader(): string {
  const username = process.env.OXY_WSA_USERNAME;
  const password = process.env.OXY_WSA_PASSWORD;
  if (!username || !password) {
    throw new Error("Missing Oxylabs credentials. Set OXY_WSA_USERNAME and OXY_WSA_PASSWORD.");
  }
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

/**
 * Extract 64-bit integer IDs from raw JSON response text using regex to prevent silent JS truncation.
 */
function extractScheduleIdFromRaw(rawText: string): string | null {
  const match = rawText.match(/"schedule_id"\s*:\s*"?(\d+)"?/i) || rawText.match(/"id"\s*:\s*"?(\d+)"?/i);
  return match ? match[1] : null;
}

/**
 * Pre-process raw JSON text from Oxylabs to ensure all 15+ digit IDs are quoted as strings before JSON.parse,
 * preserving full 64-bit integer precision.
 */
function parseWithPreservedLargeIds<T = unknown>(rawText: string): T {
  const sanitized = rawText
    .replace(/"(id|schedule_id|run_id|job_id)"\s*:\s*(\d+)/gi, '"$1": "$2"')
    .replace(/(\[|,)\s*(\d{15,})\s*(?=[,\]])/g, '$1"$2"');
  return JSON.parse(sanitized) as T;
}

function incrementReason(summary: ScrapeSummary, reason: string): void {
  summary.rejectionReasons[reason] = (summary.rejectionReasons[reason] ?? 0) + 1;
}

/**
 * Synchronize Oxylabs schedules with active sources stored in Supabase:
 * 1. Create a schedule on Oxylabs for any active source that doesn't have one.
 * 2. Deactivate any orphaned schedule on Oxylabs that is not associated with an active source.
 */
export async function syncSchedules(): Promise<{ created: number; deactivated: number; total: number }> {
  const supabase = getServiceSupabase() as unknown as SupabaseClient;

  // 1. Get active sources from Supabase
  const { data: sourcesData, error: sourcesError } = await supabase
    .from("sources")
    .select("*")
    .eq("is_active", true);

  if (sourcesError || !sourcesData) {
    throw new Error(`Failed to load active sources: ${sourcesError?.message}`);
  }
  const sources = sourcesData as unknown as SourceRow[];

  // 2. Get existing active schedules from Supabase
  const { data: dbSchedules, error: dbSchedulesError } = await supabase
    .from("oxylabs_schedules")
    .select("*")
    .eq("is_active", true);

  if (dbSchedulesError) {
    throw new Error(`Failed to load database schedules: ${dbSchedulesError.message}`);
  }

  const existingMap = new Map<string, Record<string, unknown>>();
  ((dbSchedules as Record<string, unknown>[]) ?? []).forEach((s) => {
    if (typeof s.source_id === "string") {
      existingMap.set(s.source_id, s);
    }
  });

  let createdCount = 0;

  for (const source of sources) {
    if (existingMap.has(source.id)) continue;

    console.info(`[scheduler] creating Oxylabs schedule for source: ${source.name} (${source.listing_url})`);

    // Create schedule on Oxylabs adhering strictly to Oxylabs Scheduler API docs:
    // Requires: cron, items (array of job param sets), end_time
    const res = await fetch(OXYLABS_SCHEDULES_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: getOxylabsAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cron: "0 * * * *",
        items: [
          {
            source: "universal",
            url: source.listing_url,
          },
        ],
        end_time: "2035-01-01 00:00:00",
      }),
      cache: "no-store",
    });

    const rawText = await res.text();
    if (!res.ok) {
      console.error(`[scheduler] failed to create schedule for source ${source.name}:`, rawText);
      continue;
    }

    const oxylabsScheduleId = extractScheduleIdFromRaw(rawText);
    if (!oxylabsScheduleId) {
      console.error(`[scheduler] could not extract schedule ID from raw response for ${source.name}:`, rawText);
      continue;
    }

    const { error: insertError } = await supabase.from("oxylabs_schedules").insert({
      source_id: source.id,
      oxylabs_schedule_id: oxylabsScheduleId,
      is_active: true,
    });

    if (insertError) {
      console.error(`[scheduler] failed to insert schedule into DB for ${source.name}:`, insertError.message);
    } else {
      createdCount += 1;
      console.info(`[scheduler] created Oxylabs schedule ${oxylabsScheduleId} for source ${source.name}`);
    }
  }

  // 3. Deactivate orphaned schedules on Oxylabs
  const listRes = await fetch(OXYLABS_SCHEDULES_ENDPOINT, {
    method: "GET",
    headers: { Authorization: getOxylabsAuthHeader() },
    cache: "no-store",
  });

  let deactivatedCount = 0;
  if (listRes.ok) {
    const listRaw = await listRes.text();
    try {
      const listData = parseWithPreservedLargeIds<Record<string, unknown>>(listRaw);
      const { data: allDbSchedules } = await supabase.from("oxylabs_schedules").select("oxylabs_schedule_id, is_active");
      const activeDbScheduleIds = new Set<string>();
      ((allDbSchedules as Record<string, unknown>[]) ?? []).forEach((s) => {
        if (s.is_active && typeof s.oxylabs_schedule_id === "string") {
          activeDbScheduleIds.add(s.oxylabs_schedule_id);
        }
      });

      const remoteSchedules = (listData.schedules || listData.results || []) as (string | Record<string, unknown>)[];
      for (const item of remoteSchedules) {
        const remoteId = typeof item === "string" ? item : String(item.id || item.schedule_id || "");
        if (!remoteId) continue;

        if (!activeDbScheduleIds.has(remoteId)) {
          // Deactivate orphan schedule on Oxylabs: PUT /v1/schedules/{id}/state with {"active": false}
          const deactRes = await fetch(`${OXYLABS_SCHEDULES_ENDPOINT}/${remoteId}/state`, {
            method: "PUT",
            headers: {
              Authorization: getOxylabsAuthHeader(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ active: false }),
          });

          if (deactRes.ok) {
            deactivatedCount += 1;
            console.info(`[scheduler] deactivated orphaned Oxylabs schedule ${remoteId}`);
          } else {
            console.warn(`[scheduler] failed to deactivate remote schedule ${remoteId}: status ${deactRes.status}`);
          }
        }
      }
    } catch (err) {
      console.warn("[scheduler] failed to process remote schedules list:", err);
    }
  }

  return { created: createdCount, deactivated: deactivatedCount, total: sources.length };
}

/**
 * Fetch the raw HTML content of a completed Push-Pull job created by Scheduler.
 */
async function fetchJobRawHtml(jobId: string): Promise<string | null> {
  const url = `${OXYLABS_QUERIES_ENDPOINT}/${jobId}/results?type=raw`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: getOxylabsAuthHeader() },
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    console.warn(`[scheduler] failed to fetch raw HTML for job ${jobId}, status ${res.status}`);
    return null;
  }

  const rawText = await res.text();
  try {
    const data = JSON.parse(rawText) as Record<string, unknown>;
    const results = (data.results || []) as Record<string, unknown>[];
    const firstResult = results[0];
    if (firstResult && typeof firstResult.content === "string" && firstResult.content.trim()) {
      return firstResult.content;
    }
  } catch (err) {
    console.warn(`[scheduler] failed to parse raw result JSON for job ${jobId}:`, err);
  }

  return null;
}

/**
 * Process completed Oxylabs scheduled runs:
 * 1. Read active schedules and fetch completed runs (/runs with result_status === "done").
 * 2. Fetch raw HTML for each done job via Push-Pull query results API.
 * 3. Extract candidate links, dedupe, scrape detail pages, validate, and append-only insert articles.
 * 4. Record execution in oxylabs_schedule_runs and logs tables.
 */
export async function processScheduledResults(): Promise<ScrapeSummary> {
  const startedAt = Date.now();
  const summary: ScrapeSummary = {
    status: "completed",
    sourcesChecked: 0,
    candidatesFound: 0,
    candidatesRejected: 0,
    duplicatesSkipped: 0,
    detailPagesScraped: 0,
    articlesInserted: 0,
    articlesRejected: 0,
    articlesFailed: 0,
    durationMs: 0,
    rejectionReasons: {},
  };

  const supabase = getServiceSupabase() as unknown as SupabaseClient;
  await writeScrapeLog(supabase, "started", "Scheduled results processing started", undefined, "scheduler_process");

  try {
    const { data: schedules, error: schedulesError } = await supabase
      .from("oxylabs_schedules")
      .select("id, oxylabs_schedule_id, source_id, sources(*)")
      .eq("is_active", true);

    if (schedulesError || !schedules) {
      throw new Error(`Failed to load active schedules: ${schedulesError?.message}`);
    }

    summary.sourcesChecked = schedules.length;
    console.info("[scheduler] starting scheduled results processing", { schedulesCount: schedules.length });

    for (const schedule of (schedules as unknown as Record<string, unknown>[])) {
      const source = schedule.sources as SourceRow | undefined;
      const scheduleId = schedule.oxylabs_schedule_id as string | undefined;
      const dbScheduleId = schedule.id as string | undefined;
      if (!source || !scheduleId || !dbScheduleId) continue;

      console.info(`[scheduler] checking runs for source: ${source.name} (Oxylabs schedule: ${scheduleId})`);

      try {
        const runsRes = await fetch(`${OXYLABS_SCHEDULES_ENDPOINT}/${scheduleId}/runs`, {
          method: "GET",
          headers: { Authorization: getOxylabsAuthHeader() },
          cache: "no-store",
        });

        if (!runsRes.ok) {
          console.warn(`[scheduler] failed to fetch runs for schedule ${scheduleId}: status ${runsRes.status}`);
          continue;
        }

        const runsRaw = await runsRes.text();
        const runsData = parseWithPreservedLargeIds<Record<string, unknown>>(runsRaw);
        const runs = (runsData.runs || runsData.results || []) as Record<string, unknown>[];

        if (runs.length === 0) {
          console.info(`[scheduler] no completed runs yet for source ${source.name} (Oxylabs schedule: ${scheduleId}). Waiting for next scheduled run.`);
          continue;
        }

        for (const run of runs) {
          const runId = String(run.run_id || "");
          if (!runId) continue;

          // Check if this run was already processed
          const { data: existingRun } = await supabase
            .from("oxylabs_schedule_runs")
            .select("id, status")
            .eq("oxylabs_run_id", runId)
            .maybeSingle();

          if (existingRun && existingRun.status === "completed") {
            continue;
          }

          let runCandidatesFound = 0;
          let runArticlesInserted = 0;
          const jobs = (run.jobs || []) as Record<string, unknown>[];

          for (const job of jobs) {
            const resultStatus = String(job.result_status || job.status || "");
            if (resultStatus !== "done") {
              continue;
            }

            const jobId = String(job.id || "");
            if (!jobId) continue;

            console.info(`[scheduler] fetching raw homepage HTML for done job: ${jobId}`);
            const htmlContent = await fetchJobRawHtml(jobId);
            if (!htmlContent) {
              console.warn(`[scheduler] no HTML content returned for job ${jobId}`);
              continue;
            }

            // Extract homepage candidate links
            const extraction = extractHomepageCandidates(htmlContent, source.name, source.listing_url);
            runCandidatesFound += extraction.candidates.length;
            summary.candidatesFound += extraction.candidates.length;
            summary.candidatesRejected += extraction.rejected;
            if (extraction.rejected) incrementReason(summary, "non_article_or_invalid_candidate");

            // Deduplication against existing URLs in Supabase (chunked <= 15)
            const existingUrls = await findExistingUrls(supabase, extraction.candidates.map((c) => c.url));
            const candidates = extraction.candidates
              .filter((c) => {
                const dup = existingUrls.has(c.url);
                if (dup) summary.duplicatesSkipped += 1;
                return !dup;
              })
              .slice(0, DEFAULT_PER_SOURCE_LIMIT);

            console.info(`[scheduler] candidates after dedupe for source ${source.name}: ${candidates.length}`);

            // Detail scraping and validation
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

                // Canonical URL duplicate check
                const canonicalUrl = parsed.article.canonicalUrl;
                if (canonicalUrl && (await findExistingUrls(supabase, [canonicalUrl])).has(canonicalUrl)) {
                  summary.duplicatesSkipped += 1;
                  continue;
                }

                // Insert valid article append-only
                const { error: insertError } = await supabase.from("articles").insert({
                  source_id: source.id,
                  original_url: candidate.url,
                  canonical_url: parsed.article.canonicalUrl,
                  title: parsed.article.title,
                  image_url: parsed.article.imageUrl,
                  published_at: parsed.article.publishedAt,
                  raw_text: parsed.article.rawText,
                  category: parsed.article.category,
                });

                if (insertError) {
                  if (insertError.code === "23505") {
                    summary.duplicatesSkipped += 1;
                    continue;
                  }
                  throw new Error(insertError.message);
                }

                summary.articlesInserted += 1;
                runArticlesInserted += 1;
                console.info(`[scheduler] article inserted: "${parsed.article.title}" (${candidate.url})`);
              } catch (err) {
                summary.articlesFailed += 1;
                incrementReason(summary, "detail_scrape_failed");
                console.error("[scheduler] detail page failed:", candidate.url, err instanceof Error ? err.message : err);
              }
            }
          }

          // Record run record in oxylabs_schedule_runs
          await supabase.from("oxylabs_schedule_runs").upsert({
            schedule_id: dbScheduleId,
            oxylabs_run_id: runId,
            status: "completed",
            articles_found: runCandidatesFound,
            articles_inserted: runArticlesInserted,
          });
        }
      } catch (err) {
        summary.articlesFailed += 1;
        incrementReason(summary, "source_schedule_failed");
        console.error(`[scheduler] processing failed for source ${source.name}:`, err);
      }
    }
  } catch (err) {
    summary.status = "failed";
    incrementReason(summary, "run_initialization_failed");
    console.error("[scheduler] scheduled results processing failed:", err);
  }

  summary.durationMs = Date.now() - startedAt;
  console.info("[scheduler] processing completed", summary);
  await writeScrapeLog(
    supabase,
    summary.status === "completed" ? "completed" : "failed",
    "Scheduled results processing completed",
    summary as unknown as Record<string, unknown>,
    "scheduler_process"
  );

  return summary;
}
