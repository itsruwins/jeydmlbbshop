/**
 * A screenshot attached to a listing.
 *
 * The row stores only the Storage path; the bytes live in the `account-images`
 * bucket. `storage_path` is relative to the bucket root, e.g.
 * `<account-id>/1740000000000-rank.webp`.
 */
export type AccountImage = {
  id: string;
  account_id: string;
  storage_path: string;
  alt_text: string | null;
  /** 0-based gallery position. */
  display_order: number;
  /** At most one image per account is the cover. */
  is_cover: boolean;
  created_at: string;
};
