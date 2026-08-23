"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/utils/errorMessage";

import { revalidateSocialSurfaces } from "./revalidateSocialSurfaces";

export type DeleteSocialLinkResult = { ok: true } | { ok: false; message: string };

/**
 * Removes a social destination.
 *
 * Nothing references `social_links` by foreign key, so there is no cascade to
 * think about — unlike a listing, this really is just a row.
 */
export async function deleteSocialLink(
  id: string,
): Promise<DeleteSocialLinkResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("social_links").delete().eq("id", id);

  if (error) {
    return {
      ok: false,
      message: errorMessage(error, "Could not delete the link."),
    };
  }

  revalidatePath("/admin/social-links");
  revalidateSocialSurfaces();

  return { ok: true };
}
