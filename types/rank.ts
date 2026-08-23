/**
 * A Mobile Legends rank tier, as stored in Supabase.
 *
 * There are seven, Grandmaster through Mythical Immortal. Warrior, Elite and
 * Master are deliberately not part of this marketplace. The list is never
 * hardcoded in the application — it is read from the `ranks` table so that the
 * database stays the single source of truth.
 */
export type Rank = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};
