"use client";

import { ACCOUNT_IMAGES_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/utils/errorMessage";
import type { AccountImage } from "@/types/accountImage";

export type UploadResult =
  | { ok: true; image: AccountImage }
  | { ok: false; message: string };

/**
 * Uploads one already-compressed screenshot and records it.
 *
 * Runs in the browser rather than through a Server Action so the file goes
 * straight to Storage instead of being base64'd through a Next.js request. The
 * session cookie authorises it and Storage RLS enforces admin-only writes, so
 * nothing is weakened by doing it client-side.
 *
 * Two writes that must both land: the object and the row. If the row insert
 * fails, the object is removed again — a file with no row is invisible to the
 * app and would never be cleaned up.
 */
export async function uploadAccountImage({
  accountId,
  file,
  displayOrder,
  isCover,
  altText,
}: {
  accountId: string;
  file: File;
  displayOrder: number;
  isCover: boolean;
  altText?: string | null;
}): Promise<UploadResult> {
  const supabase = createClient();

  // Timestamp plus a random suffix: two screenshots picked in the same
  // millisecond must not overwrite one another.
  const suffix = Math.random().toString(36).slice(2, 8);
  const extension = file.type === "image/webp" ? "webp" : "jpg";
  const path = `${accountId}/${Date.now()}-${suffix}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(ACCOUNT_IMAGES_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      message: errorMessage(uploadError, `Could not upload ${file.name}.`),
    };
  }

  const { data, error: insertError } = await supabase
    .from("account_images")
    .insert({
      account_id: accountId,
      storage_path: path,
      display_order: displayOrder,
      is_cover: isCover,
      alt_text: altText ?? null,
    })
    .select("id, account_id, storage_path, alt_text, display_order, is_cover, created_at")
    .single();

  if (insertError || !data) {
    // Roll the object back so the bucket does not accumulate files the
    // database has no record of.
    await supabase.storage.from(ACCOUNT_IMAGES_BUCKET).remove([path]);
    return {
      ok: false,
      message: errorMessage(insertError, `Could not save ${file.name}.`),
    };
  }

  return { ok: true, image: data as AccountImage };
}
