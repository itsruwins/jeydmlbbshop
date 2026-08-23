"use server";

import { revalidatePath } from "next/cache";

import { ACCOUNT_IMAGES_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/utils/errorMessage";

export type DeleteAccountResult = { ok: true } | { ok: false; message: string };

/**
 * Deletes a listing and the screenshots that belong to it.
 *
 * Order matters, and it is the opposite of the obvious one.
 *
 * `account_images` has `on delete cascade`, so deleting the listing row also
 * removes the image rows. Supabase Storage has no foreign keys and does not
 * cascade. Deleting the row first would therefore destroy the only record of
 * which files belonged to this account, stranding them in the bucket with
 * nothing left pointing at them.
 *
 * So: read the paths, remove the objects, and only then delete the row. If
 * Storage removal fails we stop and report rather than deleting the row anyway
 * — a listing that still exists is a recoverable problem, and orphaned files
 * nobody can find are not.
 */
export async function deleteAccount(id: string): Promise<DeleteAccountResult> {
  const supabase = await createClient();

  const { data: images, error: imagesError } = await supabase
    .from("account_images")
    .select("storage_path")
    .eq("account_id", id);

  if (imagesError) {
    return {
      ok: false,
      message: errorMessage(
        imagesError,
        "Could not read this listing's images, so nothing was deleted.",
      ),
    };
  }

  const paths = (images ?? []).map((image) => image.storage_path).filter(Boolean);

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(ACCOUNT_IMAGES_BUCKET)
      .remove(paths);

    if (storageError) {
      return {
        ok: false,
        message: errorMessage(
          storageError,
          "Could not delete this listing's images, so the listing was kept. Try again.",
        ),
      };
    }
  }

  const { error: deleteError } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return {
      ok: false,
      message: errorMessage(deleteError, "Could not delete the listing."),
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
