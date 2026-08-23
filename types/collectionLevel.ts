/**
 * One of the 45 MLBB Collection Levels.
 *
 * `sort_order` runs 1 (Amateur Collector V, the lowest) to 45 (Galaxy
 * Collector I, the highest). Always order by it. Sorting these alphabetically
 * would put "Amateur" above "Galaxy", which is backwards.
 */
export type CollectionLevel = {
  id: string;
  name: string;
  /** The tier group, e.g. "Amateur Collector". */
  category: string;
  /** The roman numeral within the category: V, IV, III, II or I. */
  level: string;
  sort_order: number;
};
