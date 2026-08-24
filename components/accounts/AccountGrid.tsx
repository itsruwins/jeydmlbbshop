import { AccountCard } from "./AccountCard";
import type { AccountWithRelations } from "@/types/account";

/**
 * `auto-fill` with a minimum column width rather than breakpoint-stepped
 * columns: the grid re-flows at whatever width it is given, which matters when
 * the same component sits in a full-width catalogue and a narrower homepage
 * section.
 *
 * `auto-fill`, specifically, not `auto-fit`. The two differ only when the
 * items do not fill the row, which is the normal case for a shop holding a
 * handful of listings: `auto-fit` collapses the empty tracks, so a single
 * account stretches into one 1,100px-wide card with a screenshot the size of a
 * billboard. `auto-fill` keeps the empty tracks, so one listing is a listing
 * and two listings sit side by side at the width a product tile should be.
 */
export function AccountGrid({
  accounts,
  priorityCount = 0,
  highlightReference = false,
}: {
  accounts: AccountWithRelations[];
  /** How many leading cards load eagerly. Only the ones above the fold. */
  priorityCount?: number;
  /** Passed straight to the cards. Set on the homepage featured wall. */
  highlightReference?: boolean;
}) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-3 sm:gap-4">
      {accounts.map((account, index) => (
        <li key={account.id} className="flex">
          <AccountCard
            account={account}
            priority={index < priorityCount}
            highlightReference={highlightReference}
          />
        </li>
      ))}
    </ul>
  );
}
