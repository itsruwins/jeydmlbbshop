"use client";

import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/utils/errorMessage";

export type SetCoverResult = { ok: true } | { ok: false; message: string };

/**
 * Makes one screenshot the cover for its listing.
 *
 * Clears the flag across the account first, then sets it on the chosen image.
 * Doing it in that order means the brief moment between the two writes has zero
 * covers rather than two — a listing that momentarily shows no cover is a
 * cosmetic blip, while two covers is an ambiguous state the gallery cannot
 * resolve.
 */
export async function setCoverImage({
  accountId,
  imageId,
}: {
  accountId: string;
  imageId: string;
}): Promise<SetCoverResult> {
  const supabase = createClient();

  const { error: clearError } = await supabase
    .from("account_images")
    .update({ is_cover: false })
    .eq("account_id", accountId)
    .eq("is_cover", true);

  if (clearError) {
    return {
      ok: false,
      message: errorMessage(clearError, "Could not change the cover image."),
    };
  }

  const { error } = await supabase
    .from("account_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  if (error) {
    return {
      ok: false,
      message: errorMessage(error, "Could not set the new cover image."),
    };
  }

  return { ok: true };
}
