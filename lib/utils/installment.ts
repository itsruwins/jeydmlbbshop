import {
  INSTALLMENT_PERCENTS,
  type Account,
  type InstallmentPercent,
} from "@/types/account";

/**
 * Turning "open for installment, 50% or 80%" into pesos.
 *
 * ## Why the pesos are computed and not stored
 *
 * A downpayment is a percentage of the price, and the price is a column on the
 * same row. Storing the product as well would mean two facts that can disagree:
 * drop a listing from ₱4,000 to ₱3,500 and the stored downpayment still says
 * ₱2,000, which is 57% of nothing anyone agreed to. Computing it on the way out
 * makes that impossible — there is only one number, and the other is derived
 * from it.
 *
 * ## Rounding
 *
 * 70% of ₱3,505 is ₱2,453.50, and centavos are never quoted in this market
 * (see `formatPrice`). The downpayment is rounded to the nearest peso and the
 * balance is then taken as `price - down` rather than rounded separately, so
 * the two always add back up to exactly the price. Rounding both independently
 * would produce pairs that sum to a peso over or under, which is the kind of
 * arithmetic a buyer notices and nobody can explain.
 */

/** One offer a buyer can take: pay this much now, this much on handover. */
export type InstallmentPlan = {
  percent: InstallmentPercent;
  /** Due up front, in whole pesos. */
  down: number;
  /** What is left afterwards. `down + balance === price`. */
  balance: number;
};

function isInstallmentPercent(value: unknown): value is InstallmentPercent {
  return (INSTALLMENT_PERCENTS as readonly unknown[]).includes(value);
}

/**
 * The stored array, cleaned up: known percentages only, no duplicates, lowest
 * first.
 *
 * Defensive on purpose. This runs over values arriving from a form, from a
 * query string and from the database, and the ordering matters for display —
 * the plans read as a ladder from the cheapest way in upwards, and Postgres
 * preserves array order rather than sorting it, so whatever order the admin
 * happened to tick the boxes in is the order that came back.
 */
export function normaliseInstallmentPercents(
  value: unknown,
): InstallmentPercent[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<InstallmentPercent>();

  for (const entry of value) {
    const parsed = typeof entry === "string" ? Number(entry) : entry;
    if (isInstallmentPercent(parsed)) seen.add(parsed);
  }

  return INSTALLMENT_PERCENTS.filter((percent) => seen.has(percent));
}

/** The peso figures behind one percentage. */
export function installmentPlan(
  price: number,
  percent: InstallmentPercent,
): InstallmentPlan {
  const down = Math.round((price * percent) / 100);
  return { percent, down, balance: price - down };
}

/**
 * Every plan on offer for a listing, or an empty array when there is no offer.
 *
 * Returns nothing for a listing that is not open for installment, and nothing
 * for one with no price to take a percentage of — a plan reading "₱0 down" is
 * not an offer, it is a division by a missing number.
 */
export function installmentPlans(
  account: Pick<Account, "price" | "installment_available" | "installment_percents">,
): InstallmentPlan[] {
  if (!account.installment_available) return [];
  if (!Number.isFinite(account.price)) return [];

  return normaliseInstallmentPercents(account.installment_percents).map(
    (percent) => installmentPlan(account.price, percent),
  );
}

/**
 * True when a buyer can actually act on the installment offer.
 *
 * Status is part of the question. A sold listing that was open for installment
 * still carries the flag — nothing clears it, and nothing should, because the
 * listing may go back on sale — but advertising terms on something nobody can
 * buy is a promise with no product behind it. Every buyer-facing surface asks
 * this rather than reading the column directly.
 */
export function offersInstallment(
  account: Pick<
    Account,
    "price" | "status" | "installment_available" | "installment_percents"
  >,
): boolean {
  return account.status === "available" && installmentPlans(account).length > 0;
}
