import type { AccountImage } from "@/types/accountImage";

/**
 * A listing's screenshots, in the order a buyer should meet them.
 *
 * Cover first, then whatever order the admin arranged in the uploader. The
 * cover is not necessarily `display_order` 0 — it is set by its own flag, and
 * re-ordering the strip does not move it — so the two rules have to be applied
 * in that sequence rather than collapsed into one sort key.
 *
 * Lived in three places before this: the gallery on the listing page and the
 * `coverImage` helper copied into both cards. The card carousels made it four,
 * which is one too many for a rule that decides what a buyer sees first.
 */
export function orderedImages(
  images: AccountImage[] | null | undefined,
): AccountImage[] {
  return [...(images ?? [])].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.display_order - b.display_order;
  });
}
