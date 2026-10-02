import { timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { processScheduledResults } from "@/lib/scraping/scheduler";
import { runAnalysis } from "@/lib/analysis/pipeline";
import { getServiceSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValidCronSecret(request: Request): boolean {
  // In development, allow manual testing without secret
  if (process.env.NODE_ENV === "development") return true;

  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // If CRON_SECRET is not configured in production, reject for security
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const expectedAuth = `Bearer ${expected}`;
    const expectedBuf = Buffer.from(expectedAuth);
    const authBuf = Buffer.from(authHeader);
    if (expectedBuf.length === authBuf.length && timingSafeEqual(expectedBuf, authBuf)) {
      return true;
    }
  }

  return false;
}

export async function GET(request: Request): Promise<Response> {
  if (!hasValidCronSecret(request)) {
    return Response.json({ error: "Unauthorized cron request" }, { status: 401 });
  }

  const supabase = getServiceSupabase() as unknown as SupabaseClient;
  const startTime = Date.now();
  console.info("[cron/pipeline] pipeline execution started");

  await supabase.from("logs").insert({
    run_type: "cron_pipeline",
    status: "started",
    message: "Hourly cron pipeline triggered",
  });

  const results: { scrapeSummary?: unknown; analysisSummary?: unknown; error?: string } = {};

  try {
    // Step 1: Process scheduled results from Oxylabs
    console.info("[cron/pipeline] step 1: processing Oxylabs scheduled results");
    try {
      results.scrapeSummary = await processScheduledResults();
      console.info("[cron/pipeline] step 1 completed", results.scrapeSummary);
    } catch (scrapeErr) {
      console.error("[cron/pipeline] scheduled results processing error:", scrapeErr);
      results.scrapeSummary = {
        status: "failed",
        error: scrapeErr instanceof Error ? scrapeErr.message : "unknown error",
      };
    }

    // Step 2: Run AI analysis and embedding generation on pending articles
    // Per AGENTS.md section 18: If step one fails, step two must still run
    console.info("[cron/pipeline] step 2: running AI analysis on pending articles");
    try {
      results.analysisSummary = await runAnalysis({ limit: 50 });
      console.info("[cron/pipeline] step 2 completed", results.analysisSummary);
    } catch (analysisErr) {
      console.error("[cron/pipeline] analysis processing error:", analysisErr);
      results.analysisSummary = {
        status: "failed",
        error: analysisErr instanceof Error ? analysisErr.message : "unknown error",
      };
    }

    const durationMs = Date.now() - startTime;
    await supabase.from("logs").insert({
      run_type: "cron_pipeline",
      status: "completed",
      message: `Hourly cron pipeline completed in ${durationMs}ms`,
      details: results,
    });

    return Response.json({
      status: "completed",
      durationMs,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    console.error("[cron/pipeline] fatal pipeline error:", error);
    const durationMs = Date.now() - startTime;

    await supabase.from("logs").insert({
      run_type: "cron_pipeline",
      status: "failed",
      message: `Hourly cron pipeline failed after ${durationMs}ms`,
      details: { error: error instanceof Error ? error.message : "unknown error" },
    });

    return Response.json(
      { error: error instanceof Error ? error.message : "Cron pipeline execution failed." },
      { status: 500 }
    );
  }
}
