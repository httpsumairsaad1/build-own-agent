import { timingSafeEqual } from "node:crypto";
import { processScheduledResults } from "@/lib/scraping/scheduler";

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

export async function POST(request: Request): Promise<Response> {
  if (!hasValidAdminSecret(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await processScheduledResults();
    return Response.json(summary, { status: summary.status === "completed" ? 200 : 500 });
  } catch (error) {
    console.error("[oxylabs-process] failed", error instanceof Error ? error.message : "unknown error");
    return Response.json(
      { error: error instanceof Error ? error.message : "Scheduled results processing failed." },
      { status: 500 }
    );
  }
}
