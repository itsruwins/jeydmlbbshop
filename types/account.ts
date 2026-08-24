import type { AccountImage } from "./accountImage";
import type { CollectionLevel } from "./collectionLevel";
import type { Rank } from "./rank";

/**
 * The four listing states.
 *
 * The database column is `text` with a CHECK constraint rather than a Postgres
 * enum, so an out-of-vocabulary value is rejected by the constraint but not by
 * the type system on the way in. `schemas/accountSchema.ts` is what actually
 * guarantees only these four reach Supabase.
 */
export const ACCOUNT_STATUSES = [
  "available",
  "reserved",
  "sold",
  "hidden",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

/**
 * Public visibility per status. `hidden` is the only one the marketplace must
 * not show; sold and reserved listings stay visible as social proof.
 *
 * This mirrors the Row Level Security policy — it does not replace it. The
 * database is what actually prevents a hidden listing from leaving the server.
 */
export const PUBLIC_STATUSES: readonly AccountStatus[] = [
  "available",
  "reserved",
  "sold",
];

export const STATUS_LABELS: Record<AccountStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  hidden: "Hidden",
};

/** A listing row exactly as it is stored. */
export type Account = {
  id: string;
  account_reference: string;
  price: number;
  rank_id: string | null;
  collection_level_id: string | null;
  server: string | null;
  account_level: number | null;
  hero_count: number | null;
  skin_count: number | null;
  description: string | null;
  status: AccountStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * A listing with its related rows resolved. PostgREST returns all of this in a
 * single round trip via embeds, so the table view costs one request rather
 * than one per listing.
 */
export type AccountWithRelations = Account & {
  rank: Pick<Rank, "id" | "name" | "sort_order"> | null;
  collection_level: Pick<
    CollectionLevel,
    "id" | "name" | "category" | "level" | "sort_order"
  > | null;
  images: AccountImage[];
};

/** The five figures on the dashboard. */
export type AccountStats = {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  featured: number;
};
