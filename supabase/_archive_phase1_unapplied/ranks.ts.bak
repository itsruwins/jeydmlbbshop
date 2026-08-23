/**
 * MLBB rank tiers. Approved at Gate 0 (decision D5): ten tiers, no divisions
 * or star counts. Finer granularity is carried by
 * `accounts.peak_mythic_points`.
 *
 * Spec v2.0 marked `rank` required but never defined the vocabulary; this list
 * closes that gap. Mirrors supabase/migrations/0010_seed_ranks.sql.
 */

export type Rank = {
  slug: string;
  label: string;
  /** 1 = Warrior (lowest) .. 10 = Mythical Immortal (highest). */
  sortOrder: number;
};

export const RANKS = [
  { slug: "warrior", label: "Warrior", sortOrder: 1 },
  { slug: "elite", label: "Elite", sortOrder: 2 },
  { slug: "master", label: "Master", sortOrder: 3 },
  { slug: "grandmaster", label: "Grandmaster", sortOrder: 4 },
  { slug: "epic", label: "Epic", sortOrder: 5 },
  { slug: "legend", label: "Legend", sortOrder: 6 },
  { slug: "mythic", label: "Mythic", sortOrder: 7 },
  { slug: "mythical_honor", label: "Mythical Honor", sortOrder: 8 },
  { slug: "mythical_glory", label: "Mythical Glory", sortOrder: 9 },
  { slug: "mythical_immortal", label: "Mythical Immortal", sortOrder: 10 },
] as const satisfies readonly Rank[];

export type RankSlug = (typeof RANKS)[number]["slug"];

const BY_SLUG: ReadonlyMap<string, Rank> = new Map(RANKS.map((r) => [r.slug, r]));

export function rankBySlug(slug: string): Rank | undefined {
  return BY_SLUG.get(slug);
}
