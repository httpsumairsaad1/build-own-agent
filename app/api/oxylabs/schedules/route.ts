import { timingSafeEqual } from "node:crypto";
import { getServiceSupabase } from "@/lib/supabase/server";
import { syncSchedules } from "@/lib/scraping/scheduler";

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

export async function GET(): Promise<Response> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("oxylabs_schedules")
      .select("*, sources(name, listing_url)")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return Response.json({ schedules: data ?? [] });
  } catch (error) {
    console.error("[oxylabs/schedules] failed to list schedules", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "Unable to load schedules." }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!hasValidAdminSecret(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncSchedules();
    return Response.json({ status: "completed", ...result });
  } catch (error) {
    console.error("[oxylabs/schedules] sync failed", error instanceof Error ? error.message : "unknown error");
    return Response.json(
      { error: error instanceof Error ? error.message : "Schedule synchronization failed." },
      { status: 500 }
    );
  }
}
