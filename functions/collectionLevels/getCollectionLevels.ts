import { createClient } from "@/lib/supabase/server";
import type { CollectionLevel } from "@/types/collectionLevel";

/**
 * All 45 collection levels, lowest first.
 *
 * `sort_order` is the only correct ordering: 1 is Amateur Collector V and 45 is
 * Galaxy Collector I. Sorting these by name would put Amateur above Galaxy,
 * which inverts the progression.
 */
export async function getCollectionLevels(): Promise<CollectionLevel[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collection_levels")
    .select("id, name, category, level, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Could not load collection levels: ${error.message}`);
  }

  return (data ?? []) as CollectionLevel[];
}
