"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/utils/errorMessage";

export type SetFeaturedResult = { ok: true } | { ok: false; message: string };

/**
 * Toggles the featured flag from the accounts table.
 *
 * Featured is a column on `accounts` (`is_featured`), not a separate table —
 * a listing can only be featured in one way, and there is nothing to keep in
 * sync.
 *
 * Only an available listing can be featured. The toggle is refused on anything
 * else with an explanation, rather than silently succeeding and setting a flag
 * that `updateAccountStatus` would clear again the next time the status moved.
 */
export async function setAccountFeatured(
  id: string,
  isFeatured: boolean,
): Promise<SetFeaturedResult> {
  const supabase = await createClient();

  if (isFeatured) {
    const { data, error: readError } = await supabase
      .from("accounts")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (readError || !data) {
      return {
        ok: false,
        message: errorMessage(readError, "Could not find that listing."),
      };
    }

    if (data.status !== "available") {
      return {
        ok: false,
        message:
          "Only an available listing can be featured. Set it back to available first.",
      };
    }
  }

  const { error } = await supabase
    .from("accounts")
    .update({ is_featured: isFeatured })
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      message: errorMessage(error, "Could not change the featured setting."),
    };
  }

  revalidatePath("/admin/accounts");
  revalidatePath("/admin/dashboard");
  // The buyer-facing pages are cached, so an admin change has to say so
  // explicitly or the catalogue and homepage would lag behind by up to the
  // revalidate window.
  revalidatePath("/");
  revalidatePath("/accounts");

  return { ok: true };
}
