import { supabase } from "../client";
import type { SourceRow } from "../types";

export async function getActiveSources(): Promise<SourceRow[]> {
  try {
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.warn("Supabase getActiveSources error:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn("Failed to fetch sources from Supabase:", err);
    return [];
  }
}
