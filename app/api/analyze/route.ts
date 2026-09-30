import { timingSafeEqual } from "node:crypto";
import { runAnalysis, type AnalysisRequest } from "@/lib/analysis/pipeline";

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

function parseInput(value: unknown): AnalysisRequest | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const articleIds = input.articleIds;
  const limit = input.limit;
  if (articleIds !== undefined && (!Array.isArray(articleIds) || articleIds.some((id) => typeof id !== "string" || !id.trim()))) return null;
  if (limit !== undefined && (!Number.isInteger(limit) || (limit as number) < 1 || (limit as number) > 1_000)) return null;
  return { articleIds: articleIds as string[] | undefined, limit: limit as number | undefined };
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
  if (!input) return Response.json({ error: "Invalid articleIds or limit." }, { status: 400 });

  const summary = await runAnalysis(input);
  return Response.json(summary, { status: summary.status === "completed" ? 200 : 500 });
}
