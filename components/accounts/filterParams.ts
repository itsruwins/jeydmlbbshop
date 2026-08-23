import type { PublicSort } from "@/functions/accounts/getPublicAccounts";

/**
 * The catalogue's URL contract, parsed in one place.
 *
 * Filters live in the URL rather than in component state so a filtered view can
 * be linked, bookmarked and shared — which matters most for the person running
 * the shop, who can post "Mythic accounts under ₱10,000" straight to social
 * media as a working link.
 *
 * Every reader is defensive: a query string is user input, and anything
 * unrecognised falls back to the default rather than reaching the database.
 */

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
  { value: "collection_desc", label: "Collection level" },
  { value: "skins_desc", label: "Most skins" },
] as const;

/** Chip values for the minimum-skins filter. */
export const SKIN_STEPS = [50, 100, 200, 300] as const;

export type CatalogueParams = {
  search: string;
  rankIds: string[];
  minPrice?: number;
  maxPrice?: number;
  minCollectionSort?: number;
  minSkins?: number;
  sort: PublicSort;
};

type Raw = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * A whole number clamped into range, or undefined when there is no number at
 * all.
 *
 * Clamping rather than discarding is the important part. An earlier version
 * dropped anything out of range, so `?min_price=99999999` silently removed the
 * filter and showed the *entire* catalogue — the opposite of what was asked
 * for. Clamping to the maximum answers honestly: nothing costs that much, so
 * nothing matches.
 *
 * Genuine nonsense — `?min_price=abc` — still yields undefined, because there
 * is no number there to honour.
 */
function readInt(
  value: string | string[] | undefined,
  { min, max }: { min: number; max: number },
): number | undefined {
  const raw = one(value);
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(max, Math.max(min, parsed));
}

export function readCatalogueParams(params: Raw): CatalogueParams {
  const sortRaw = one(params.sort);
  const sort = SORT_OPTIONS.some((option) => option.value === sortRaw)
    ? (sortRaw as PublicSort)
    : "newest";

  // `?rank=a&rank=b` and `?rank=a,b` both work — the first is what checkboxes
  // produce, the second is what someone hand-writing a link would try.
  const rankRaw = params.rank;
  const rankIds = (Array.isArray(rankRaw) ? rankRaw : rankRaw ? [rankRaw] : [])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  const minPrice = readInt(params.min_price, { min: 0, max: 10_000_000 });
  const maxPrice = readInt(params.max_price, { min: 0, max: 10_000_000 });

  return {
    search: one(params.q)?.trim() ?? "",
    rankIds,
    // A reversed range would return nothing at all and look like a broken
    // filter, so the two are swapped back into order.
    minPrice:
      minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice
        ? maxPrice
        : minPrice,
    maxPrice:
      minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice
        ? minPrice
        : maxPrice,
    minCollectionSort: readInt(params.min_collection, { min: 1, max: 45 }),
    minSkins: readInt(params.min_skins, { min: 0, max: 5000 }),
    sort,
  };
}

/** True when anything is narrowing the catalogue. Drives the "clear" affordance. */
export function hasActiveFilters(params: CatalogueParams): boolean {
  return (
    params.search !== "" ||
    params.rankIds.length > 0 ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined ||
    params.minCollectionSort !== undefined ||
    params.minSkins !== undefined
  );
}

export function countActiveFilters(params: CatalogueParams): number {
  return [
    params.rankIds.length > 0,
    params.minPrice !== undefined || params.maxPrice !== undefined,
    params.minCollectionSort !== undefined,
    params.minSkins !== undefined,
  ].filter(Boolean).length;
}
