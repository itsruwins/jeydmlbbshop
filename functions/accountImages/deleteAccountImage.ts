"use client";

import { ACCOUNT_IMAGES_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/utils/errorMessage";

export type DeleteImageResult = { ok: true } | { ok: false; message: string };

/**
 * Removes one screenshot, object and row.
 *
 * The object goes first for the same reason as in `deleteAccount`: the row is
 * the only record of the path, so losing it first would strand the file.
 *
 * Promoting a new cover when this one was the cover is the caller's job — it
 * needs to know the remaining order, which this function does not.
 */
export async function deleteAccountImage({
  id,
  storagePath,
}: {
  id: string;
  storagePath: string;
}): Promise<DeleteImageResult> {
  const supabase = createClient();

  const { error: storageError } = await supabase.storage
    .from(ACCOUNT_IMAGES_BUCKET)
    .remove([storagePath]);

  if (storageError) {
    return {
      ok: false,
      message: errorMessage(storageError, "Could not delete the image file."),
    };
  }

  const { error } = await supabase.from("account_images").delete().eq("id", id);

  if (error) {
    return {
      ok: false,
      message: errorMessage(error, "The file was removed but its record was not."),
    };
  }

  return { ok: true };
}
