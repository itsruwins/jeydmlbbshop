import { compareReference } from "@/lib/utils/compareReference";
import { createPublicClient } from "@/lib/supabase/public";
import { PUBLIC_STATUSES, type AccountStatus, type AccountWithRelations } from "@/types/account";

import {
  ACCOUNT_WITH_INNER_COLLECTION_SELECT,
  ACCOUNT_WITH_RELATIONS_SELECT,
  COLLECTION_SORT_ORDER_PATH,
} from "./accountSelect";

export type PublicSort =
  | "reference"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "collection_desc"
  | "skins_desc";

export type PublicFilters = {
  search?: string;
  /** Rank ids. Empty means every rank. */
  rankIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  /** Inclusive bounds on collection_levels.sort_order, 1–45. */
  minCollectionSort?: number;
  minSkins?: number;
  /** Only listings open for a downpayment. Absent or false means every listing. */
  installmentOnly?: boolean;
  sort?: PublicSort;
};

export type PublicCatalogue = {
  /** Available listings, in the requested order. */
  available: AccountWithRelations[];
  /** Reserved and sold, newest first. Kept separate, not interleaved. */
  closed: AccountWithRelations[];
};

const ORDER: Record<PublicSort, { column: string; ascending: boolean }> = {
  // Ascending, so the shop's numbering reads forwards: J1 at the top. The
  // database can only order this as text; `compareReference` finishes the job
  // below, where the digits can be compared as numbers.
  reference: { column: "account_reference", ascending: true },
  newest: { column: "created_at", ascending: false },
  price_asc: { column: "price", ascending: true },
  price_desc: { column: "price", ascending: false },
  // Ordering by an embedded column: PostgREST understands the relation path.
  collection_desc: { column: COLLECTION_SORT_ORDER_PATH, ascending: false },
  skins_desc: { column: "skin_count", ascending: false },
};

/**
 * The public catalogue, split into what a buyer can act on and what they cannot.
 *
 * The split is the point. Sold and reserved listings stay visible — for a new
 * shop they are the only evidence that sales actually happen — but interleaving
 * them means a buyer scrolls past things they cannot buy. Available first, the
 * rest below and visually quieter.
 *
 * Hidden listings are excluded twice over, deliberately.
 *
 * Row Level Security is the real control: read as `anon`, the database never
 * returns a hidden row. The explicit `.in("status", PUBLIC_STATUSES)` below is a
 * second, independent layer — if a policy is ever loosened by accident, the
 * query still asks only for what the public may see.
 *
 * The redundancy is the point. An earlier version relied on RLS alone and was
 * still correct, but a *client* mistake (forwarding the admin's session to a
 * public page) defeated it. Two layers means one mistake is not enough.
 */
export async function getPublicAccounts(
  filters: PublicFilters = {},
): Promise<PublicCatalogue> {
  const {
    search,
    rankIds = [],
    minPrice,
    maxPrice,
    minCollectionSort,
    minSkins,
    installmentOnly = false,
    sort = "newest",
  } = filters;

  const supabase = createPublicClient();

  // Filtering or sorting on a collection-level column needs the join to be
  // restricting, which a plain embed is not. Only pay for that when one of
  // those is actually in play — an inner join would otherwise silently drop
  // any listing that has no collection level.
  const needsInnerCollection =
    typeof minCollectionSort === "number" || sort === "collection_desc";

  let query = supabase
    .from("accounts")
    .select(
      needsInnerCollection
        ? ACCOUNT_WITH_INNER_COLLECTION_SELECT
        : ACCOUNT_WITH_RELATIONS_SELECT,
    )
    // Belt and braces. RLS already does this; see the note above.
    .in("status", PUBLIC_STATUSES);

  if (rankIds.length > 0) {
    query = query.in("rank_id", rankIds);
  }

  if (typeof minPrice === "number") query = query.gte("price", minPrice);
  if (typeof maxPrice === "number") query = query.lte("price", maxPrice);
  if (typeof minSkins === "number") query = query.gte("skin_count", minSkins);

  // The flag only, not the percentages. A buyer asking for installment is
  // asking whether they can pay in two parts at all; which fractions are on
  // offer is what the listing page is for.
  if (installmentOnly) query = query.eq("installment_available", true);

  if (typeof minCollectionSort === "number") {
    // Addressed by the embed's alias, matching how it is selected above.
    query = query.gte("collection_level.sort_order", minCollectionSort);
  }

  const term = search?.trim();
  if (term) {
    // Reference only. This used to search the title and description too, but
    // neither is collected any more — title no longer exists as a column at
    // all — so those clauses could only ever match listings created before the
    // fields were removed. A search that silently works on old rows and not on
    // new ones is worse than one that is honest about what it matches.
    const safe = term.trim();
    if (safe) {
      query = query.ilike("account_reference", `%${safe}%`);
    }
  }

  const order = ORDER[sort] ?? ORDER.newest;
  query = query.order(order.column, {
    ascending: order.ascending,
    // Listings missing the sorted value sink to the bottom either way, rather
    // than heading the list on a descending sort.
    nullsFirst: false,
  });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Could not load the catalogue: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as AccountWithRelations[];

  // PostgREST orders `account_reference` as the text column it is, which puts
  // `J10` between `J1` and `J2`. The ordering above is still worth asking for
  // — it makes the fetch deterministic rather than leaving the tie-break to
  // the planner — but the shop's own numbering is restored here. Safe to do in
  // memory: the catalogue is not paginated, so these are all the rows there
  // are, not a page of them.
  if (sort === "reference") {
    rows.sort((a, b) =>
      compareReference(a.account_reference, b.account_reference),
    );
  }

  const isAvailable = (status: AccountStatus) => status === "available";

  return {
    available: rows.filter((row) => isAvailable(row.status)),
    closed: rows.filter((row) => !isAvailable(row.status)),
  };
}
