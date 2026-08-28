/**
 * Display formatting. Kept in one place so a price never renders two different
 * ways on two screens.
 */

const PESO = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const COMPACT = new Intl.NumberFormat("en-PH");

const DATE = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/** `1500` -> `₱1,500`. Whole pesos only; centavos are never quoted here. */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return PESO.format(value);
}

/**
 * `1500` -> `1,500`. An em dash for absent values, never `0` or `null`.
 *
 * `isMin` is the "at least" case a seller quotes when they have not counted to
 * the unit: `formatCount(100, true)` -> `100+`. It is stored beside the figure
 * rather than baked into it (`accounts.hero_count_is_min`), so the number is
 * still a number the catalogue can filter on.
 */
export function formatCount(
  value: number | null | undefined,
  isMin = false,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  const figure = COMPACT.format(value);
  return isMin ? `${figure}+` : figure;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : DATE.format(date);
}

/** Absent text renders as an em dash, so an empty cell is never ambiguous. */
export function orDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}
