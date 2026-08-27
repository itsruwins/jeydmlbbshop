import type { AccountWithRelations } from "@/types/account";
import type { CollectionLevel } from "@/types/collectionLevel";
import type { Rank } from "@/types/rank";

import { SKIN_STEPS, type CatalogueParams } from "./filterParams";

/**
 * How many listings each filter option would actually return.
 *
 * ## Why a filter should say this at all
 *
 * The rail lists seven ranks and nine collector tiers whether or not the shop
 * holds a single account in any of them. Without counts, narrowing is guesswork
 * with a penalty: tap Mythical Immortal, wait, get an empty page, back out,
 * try again. A number beside each option turns that into a decision made before
 * the tap, and an option that would return nothing can be shown as spent rather
 * than offered.
 *
 * ## The one rule that makes counts honest
 *
 * **A facet never counts itself.** The number beside "Mythic" is how many
 * listings would be shown if Mythic were added to the current selection — so it
 * is computed with every *other* filter applied and the rank filter lifted.
 * Count it with its own dimension applied and the answer is either the total
 * you already have or, once something is selected, zero for every unselected
 * option — a rail of zeroes that says nothing is available when in fact one tap
 * would show it.
 *
 * That is what `except` is for below, and it is the whole reason this is not
 * four `Array.filter` calls in the component.
 *
 * ## Why it is done here and not in the database
 *
 * Four faceted counts is four more round trips, or one query with four
 * correlated aggregates. This shop's entire public catalogue is a few
 * dozen rows and is already fetched once for the page; counting them in memory
 * is free and cannot disagree with what the grid shows. If the catalogue ever
 * reaches the thousands this is the thing to move into Postgres — not before.
 */

type Dimension = "rank" | "price" | "collection" | "skins" | "installment";

/**
 * Mirrors the query in `getPublicAccounts` exactly, minus one dimension.
 *
 * The mirroring is a real risk and worth stating: if the query gains a filter
 * and this does not, the counts start promising results the grid will not show.
 * The two places to change together are this function and the `if` block in
 * `getPublicAccounts`.
 *
 * The nulls follow the query rather than being lenient. `.in("rank_id", …)`,
 * `.gte("skin_count", …)` and the restricting collection join all drop rows
 * with nothing in the column, so a listing with no skin count is not counted
 * under "50+" here either.
 */
function matches(
  account: AccountWithRelations,
  params: CatalogueParams,
  except: Dimension | null,
): boolean {
  if (params.search) {
    const term = params.search.toLowerCase();
    if (!account.account_reference.toLowerCase().includes(term)) return false;
  }

  if (except !== "rank" && params.rankIds.length > 0) {
    if (!account.rank_id || !params.rankIds.includes(account.rank_id)) {
      return false;
    }
  }

  if (except !== "price") {
    if (params.minPrice !== undefined && account.price < params.minPrice) {
      return false;
    }
    if (params.maxPrice !== undefined && account.price > params.maxPrice) {
      return false;
    }
  }

  if (except !== "collection" && params.minCollectionSort !== undefined) {
    const order = account.collection_level?.sort_order;
    if (order === undefined || order === null) return false;
    if (order < params.minCollectionSort) return false;
  }

  if (except !== "skins" && params.minSkins !== undefined) {
    if (account.skin_count === null) return false;
    if (account.skin_count < params.minSkins) return false;
  }

  if (except !== "installment" && params.installmentOnly) {
    if (!account.installment_available) return false;
  }

  return true;
}

/** One rung of the rank or collection ladder. */
export type FacetOption = {
  /** What the option writes into the URL. */
  value: string;
  label: string;
  /** How many listings selecting it would show. */
  count: number;
};

export type PriceFacet = {
  /** Slider bounds, rounded outward to a round number. */
  min: number;
  max: number;
  /** The slider's granularity, derived from how wide the range is. */
  step: number;
};

export type CatalogueFacets = {
  ranks: FacetOption[];
  collections: FacetOption[];
  skins: Array<{ value: number; count: number }>;
  price: PriceFacet | null;
  /** How many listings the installment toggle would return. */
  installment: number;
};

/**
 * A round number near `range / 40` — 50, 100, 250, 500, 1,000 and so on.
 *
 * A slider whose step is a fraction of its range produces prices like ₱3,417,
 * which nobody typed and nobody means. Snapping to a round number means every
 * position the handle can stop at is a price a person would say out loud.
 */
function niceStep(range: number): number {
  if (range <= 0) return 100;
  const raw = range / 40;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalised = raw / magnitude;
  const factor = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
  return Math.max(50, factor * magnitude);
}

function priceFacet(all: AccountWithRelations[]): PriceFacet | null {
  const prices = all.map((account) => account.price).filter(Number.isFinite);
  if (prices.length === 0) return null;

  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);

  // Bounds come from the *whole* catalogue, not from the currently filtered
  // set. If they tracked the filters, ticking a rank would rescale the track
  // under the handles and move a price the buyer had already chosen — the one
  // thing a range control must never do.
  const step = niceStep(highest - lowest);
  const min = Math.floor(lowest / step) * step;
  const max = Math.max(min + step, Math.ceil(highest / step) * step);

  return { min, max, step };
}

export function buildFacets({
  all,
  params,
  ranks,
  collectionLevels,
}: {
  /** Every publicly visible listing, unfiltered. */
  all: AccountWithRelations[];
  params: CatalogueParams;
  ranks: Rank[];
  collectionLevels: CollectionLevel[];
}): CatalogueFacets {
  const withoutRank = all.filter((account) => matches(account, params, "rank"));
  const withoutCollection = all.filter((account) =>
    matches(account, params, "collection"),
  );
  const withoutSkins = all.filter((account) =>
    matches(account, params, "skins"),
  );
  const withoutInstallment = all.filter((account) =>
    matches(account, params, "installment"),
  );

  // The 45 levels collapsed to their nine tier heads. "Exalted Collector and
  // above" is the question a buyer actually has; a 45-rung ladder is not.
  // Lowest sort_order per category, and the levels arrive lowest first.
  const tiers: Array<{ label: string; sortOrder: number }> = [];
  for (const level of collectionLevels) {
    if (!tiers.some((tier) => tier.label === level.category)) {
      tiers.push({ label: level.category, sortOrder: level.sort_order });
    }
  }

  return {
    ranks: ranks.map((rank) => ({
      value: rank.id,
      label: rank.name,
      count: withoutRank.filter((account) => account.rank_id === rank.id).length,
    })),

    collections: tiers.map((tier) => ({
      value: String(tier.sortOrder),
      label: tier.label,
      count: withoutCollection.filter((account) => {
        const order = account.collection_level?.sort_order;
        return typeof order === "number" && order >= tier.sortOrder;
      }).length,
    })),

    skins: SKIN_STEPS.map((step) => ({
      value: step,
      count: withoutSkins.filter(
        (account) => account.skin_count !== null && account.skin_count >= step,
      ).length,
    })),

    price: priceFacet(all),

    // The flag, matching the query. A listing marked open for installment with
    // no percentages on it cannot exist — the database refuses the pair — so
    // there is nothing here for the count to disagree with.
    installment: withoutInstallment.filter(
      (account) => account.installment_available,
    ).length,
  };
}
