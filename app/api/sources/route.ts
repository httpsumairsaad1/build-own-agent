import { getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("sources")
      .select("id, name, listing_url, parser_strategy, logo_url")
      .eq("is_active", true)
      .order("name");
    if (error) throw new Error(error.message);
    return Response.json({ sources: data ?? [] });
  } catch (error) {
    console.error("[sources] failed to load active sources", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "Unable to load active sources." }, { status: 500 });
  }
}
