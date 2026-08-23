import { createClient } from "@/lib/supabase/server";
import type { AccountImage } from "@/types/accountImage";

/** A listing's screenshots in gallery order. */
export async function getAccountImages(
  accountId: string,
): Promise<AccountImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("account_images")
    .select("id, account_id, storage_path, alt_text, display_order, is_cover, created_at")
    .eq("account_id", accountId)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Could not load images: ${error.message}`);
  }

  return (data ?? []) as AccountImage[];
}
