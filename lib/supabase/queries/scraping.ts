import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SourceRow } from "../types";

export async function getSelectedActiveSources(
  supabase: SupabaseClient,
  sourceIds?: string[]
): Promise<SourceRow[]> {
  const { data, error } = await supabase.from("sources").select("*").eq("is_active", true).order("name");
  if (error) throw new Error(`Unable to load sources: ${error.message}`);
  const sources = (data ?? []) as unknown as SourceRow[];
  if (!sourceIds?.length) return sources;

  const wanted = new Set(sourceIds);
  const selected = sources.filter((source) => wanted.has(source.id));
  if (selected.length !== wanted.size) throw new Error("One or more selected sources are unknown or inactive.");
  return selected;
}

export async function findExistingUrls(
  supabase: SupabaseClient,
  urls: string[]
): Promise<Set<string>> {
  const existing = new Set<string>();
  for (let index = 0; index < urls.length; index += 15) {
    const chunk = urls.slice(index, index + 15);
    const [originalResult, canonicalResult] = await Promise.all([
      supabase.from("articles").select("original_url").in("original_url", chunk),
      supabase.from("articles").select("canonical_url").in("canonical_url", chunk),
    ]);
    if (originalResult.error) throw new Error(`URL deduplication failed: ${originalResult.error.message}`);
    if (canonicalResult.error) throw new Error(`URL deduplication failed: ${canonicalResult.error.message}`);
    originalResult.data?.forEach((row) => existing.add(row.original_url));
    canonicalResult.data?.forEach((row) => row.canonical_url && existing.add(row.canonical_url));
  }
  return existing;
}

export async function writeScrapeLog(
  supabase: SupabaseClient,
  status: "started" | "completed" | "failed",
  message: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from("logs").insert({
    run_type: "manual_scrape",
    status,
    message,
    details: details ?? null,
  });
  if (error) console.error("[scrape] failed to write run log", error.message);
}

