/**
 * The 45 canonical MLBB Collection Levels — spec v2.0 §8.
 *
 * EXACT VALUES REQUIRED. Do not add, remove, rename, abbreviate, reorder or
 * substitute any entry. Amateur Collector V is the lowest; Galaxy Collector I
 * is the highest.
 *
 * This list mirrors supabase/migrations/0009_seed_collection_levels.sql. The
 * database is the integrity authority (a composite foreign key makes a
 * mismatched slug/sortOrder pair impossible to store); this constant exists so
 * that labels, categories and badge tints resolve with no join and full type
 * safety. A parity check asserts the two stay identical.
 */

export const COLLECTION_TIERS = ["V", "IV", "III", "II", "I"] as const;
export type CollectionTier = (typeof COLLECTION_TIERS)[number];

export type CollectionLevel = {
  slug: string;
  label: string;
  category: string;
  tier: CollectionTier;
  /** 1 = Amateur Collector V (lowest) .. 45 = Galaxy Collector I (highest). */
  sortOrder: number;
};

export const COLLECTION_LEVELS = [
  { slug: "amateur_collector_v", label: "Amateur Collector V", category: "Amateur Collector", tier: "V", sortOrder: 1 },
  { slug: "amateur_collector_iv", label: "Amateur Collector IV", category: "Amateur Collector", tier: "IV", sortOrder: 2 },
  { slug: "amateur_collector_iii", label: "Amateur Collector III", category: "Amateur Collector", tier: "III", sortOrder: 3 },
  { slug: "amateur_collector_ii", label: "Amateur Collector II", category: "Amateur Collector", tier: "II", sortOrder: 4 },
  { slug: "amateur_collector_i", label: "Amateur Collector I", category: "Amateur Collector", tier: "I", sortOrder: 5 },
  { slug: "junior_collector_v", label: "Junior Collector V", category: "Junior Collector", tier: "V", sortOrder: 6 },
  { slug: "junior_collector_iv", label: "Junior Collector IV", category: "Junior Collector", tier: "IV", sortOrder: 7 },
  { slug: "junior_collector_iii", label: "Junior Collector III", category: "Junior Collector", tier: "III", sortOrder: 8 },
  { slug: "junior_collector_ii", label: "Junior Collector II", category: "Junior Collector", tier: "II", sortOrder: 9 },
  { slug: "junior_collector_i", label: "Junior Collector I", category: "Junior Collector", tier: "I", sortOrder: 10 },
  { slug: "seasoned_collector_v", label: "Seasoned Collector V", category: "Seasoned Collector", tier: "V", sortOrder: 11 },
  { slug: "seasoned_collector_iv", label: "Seasoned Collector IV", category: "Seasoned Collector", tier: "IV", sortOrder: 12 },
  { slug: "seasoned_collector_iii", label: "Seasoned Collector III", category: "Seasoned Collector", tier: "III", sortOrder: 13 },
  { slug: "seasoned_collector_ii", label: "Seasoned Collector II", category: "Seasoned Collector", tier: "II", sortOrder: 14 },
  { slug: "seasoned_collector_i", label: "Seasoned Collector I", category: "Seasoned Collector", tier: "I", sortOrder: 15 },
  { slug: "expert_collector_v", label: "Expert Collector V", category: "Expert Collector", tier: "V", sortOrder: 16 },
  { slug: "expert_collector_iv", label: "Expert Collector IV", category: "Expert Collector", tier: "IV", sortOrder: 17 },
  { slug: "expert_collector_iii", label: "Expert Collector III", category: "Expert Collector", tier: "III", sortOrder: 18 },
  { slug: "expert_collector_ii", label: "Expert Collector II", category: "Expert Collector", tier: "II", sortOrder: 19 },
  { slug: "expert_collector_i", label: "Expert Collector I", category: "Expert Collector", tier: "I", sortOrder: 20 },
  { slug: "renowned_collector_v", label: "Renowned Collector V", category: "Renowned Collector", tier: "V", sortOrder: 21 },
  { slug: "renowned_collector_iv", label: "Renowned Collector IV", category: "Renowned Collector", tier: "IV", sortOrder: 22 },
  { slug: "renowned_collector_iii", label: "Renowned Collector III", category: "Renowned Collector", tier: "III", sortOrder: 23 },
  { slug: "renowned_collector_ii", label: "Renowned Collector II", category: "Renowned Collector", tier: "II", sortOrder: 24 },
  { slug: "renowned_collector_i", label: "Renowned Collector I", category: "Renowned Collector", tier: "I", sortOrder: 25 },
  { slug: "exalted_collector_v", label: "Exalted Collector V", category: "Exalted Collector", tier: "V", sortOrder: 26 },
  { slug: "exalted_collector_iv", label: "Exalted Collector IV", category: "Exalted Collector", tier: "IV", sortOrder: 27 },
  { slug: "exalted_collector_iii", label: "Exalted Collector III", category: "Exalted Collector", tier: "III", sortOrder: 28 },
  { slug: "exalted_collector_ii", label: "Exalted Collector II", category: "Exalted Collector", tier: "II", sortOrder: 29 },
  { slug: "exalted_collector_i", label: "Exalted Collector I", category: "Exalted Collector", tier: "I", sortOrder: 30 },
  { slug: "mega_collector_v", label: "Mega Collector V", category: "Mega Collector", tier: "V", sortOrder: 31 },
  { slug: "mega_collector_iv", label: "Mega Collector IV", category: "Mega Collector", tier: "IV", sortOrder: 32 },
  { slug: "mega_collector_iii", label: "Mega Collector III", category: "Mega Collector", tier: "III", sortOrder: 33 },
  { slug: "mega_collector_ii", label: "Mega Collector II", category: "Mega Collector", tier: "II", sortOrder: 34 },
  { slug: "mega_collector_i", label: "Mega Collector I", category: "Mega Collector", tier: "I", sortOrder: 35 },
  { slug: "world_collector_v", label: "World Collector V", category: "World Collector", tier: "V", sortOrder: 36 },
  { slug: "world_collector_iv", label: "World Collector IV", category: "World Collector", tier: "IV", sortOrder: 37 },
  { slug: "world_collector_iii", label: "World Collector III", category: "World Collector", tier: "III", sortOrder: 38 },
  { slug: "world_collector_ii", label: "World Collector II", category: "World Collector", tier: "II", sortOrder: 39 },
  { slug: "world_collector_i", label: "World Collector I", category: "World Collector", tier: "I", sortOrder: 40 },
  { slug: "galaxy_collector_v", label: "Galaxy Collector V", category: "Galaxy Collector", tier: "V", sortOrder: 41 },
  { slug: "galaxy_collector_iv", label: "Galaxy Collector IV", category: "Galaxy Collector", tier: "IV", sortOrder: 42 },
  { slug: "galaxy_collector_iii", label: "Galaxy Collector III", category: "Galaxy Collector", tier: "III", sortOrder: 43 },
  { slug: "galaxy_collector_ii", label: "Galaxy Collector II", category: "Galaxy Collector", tier: "II", sortOrder: 44 },
  { slug: "galaxy_collector_i", label: "Galaxy Collector I", category: "Galaxy Collector", tier: "I", sortOrder: 45 },
] as const satisfies readonly CollectionLevel[];

export type CollectionLevelSlug = (typeof COLLECTION_LEVELS)[number]["slug"];

/** Contiguous sortOrder bounds per category — spec §8.1 within-category filters. */
export const COLLECTION_CATEGORY_RANGES: Record<string, readonly [number, number]> = {
  "Amateur Collector": [1, 5],
  "Junior Collector": [6, 10],
  "Seasoned Collector": [11, 15],
  "Expert Collector": [16, 20],
  "Renowned Collector": [21, 25],
  "Exalted Collector": [26, 30],
  "Mega Collector": [31, 35],
  "World Collector": [36, 40],
  "Galaxy Collector": [41, 45],
};

const BY_SLUG: ReadonlyMap<string, CollectionLevel> = new Map(
  COLLECTION_LEVELS.map((l) => [l.slug, l]),
);
const BY_SORT: ReadonlyMap<number, CollectionLevel> = new Map(
  COLLECTION_LEVELS.map((l) => [l.sortOrder, l]),
);

export function collectionLevelBySlug(slug: string): CollectionLevel | undefined {
  return BY_SLUG.get(slug);
}

export function collectionLevelBySortOrder(sortOrder: number): CollectionLevel | undefined {
  return BY_SORT.get(sortOrder);
}

/** Grouped for the admin combobox — 9 groups of 5, in progression order. */
export function collectionLevelsByCategory(): { category: string; levels: CollectionLevel[] }[] {
  const groups: { category: string; levels: CollectionLevel[] }[] = [];
  for (const level of COLLECTION_LEVELS) {
    const last = groups.at(-1);
    if (last?.category === level.category) last.levels.push(level);
    else groups.push({ category: level.category, levels: [level] });
  }
  return groups;
}
