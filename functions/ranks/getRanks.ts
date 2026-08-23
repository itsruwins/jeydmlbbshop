import { createClient } from "@/lib/supabase/server";
import type { Rank } from "@/types/rank";

/**
 * The seven active ranks, lowest first.
 *
 * Read from Supabase rather than a constant so the dropdown can never drift
 * from what the database will accept. Ordered by `sort_order` — Grandmaster
 * through Mythical Immortal is a progression, and alphabetical order would
 * scramble it.
 */
export async function getRanks(): Promise<Rank[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ranks")
    .select("id, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Could not load ranks: ${error.message}`);
  }

  return (data ?? []) as Rank[];
}
