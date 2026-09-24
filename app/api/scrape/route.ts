import { timingSafeEqual } from "node:crypto";
import { runManualScrape } from "@/lib/scraping/pipeline";
import type { ScrapeRequest } from "@/lib/scraping/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValidAdminSecret(request: Request): boolean {
  const expected = process.env.VIBEXNEWS_ADMIN_SECRET;
  const received = request.headers.get("x-vibexnews-admin-secret");
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function parseInput(value: unknown): ScrapeRequest | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const sourceIds = input.sourceIds;
  const perSourceLimit = input.perSourceLimit;
  if (sourceIds !== undefined && (!Array.isArray(sourceIds) || sourceIds.some((id) => typeof id !== "string" || !id.trim()))) return null;
  if (perSourceLimit !== undefined && (!Number.isInteger(perSourceLimit) || (perSourceLimit as number) < 1 || (perSourceLimit as number) > 5)) return null;
  return { sourceIds: sourceIds as string[] | undefined, perSourceLimit: perSourceLimit as number | undefined };
}

export async function POST(request: Request): Promise<Response> {
  if (!hasValidAdminSecret(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON request body." }, { status: 400 });
  }
  const input = parseInput(body);
  if (!input) return Response.json({ error: "Invalid sourceIds or perSourceLimit (must be an integer from 1 through 5)." }, { status: 400 });

  const summary = await runManualScrape(input);
  return Response.json(summary, { status: summary.status === "completed" ? 200 : 500 });
}
