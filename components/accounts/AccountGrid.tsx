import { AccountCard } from "./AccountCard";
import type { AccountWithRelations } from "@/types/account";

/**
 * `auto-fit` with a minimum column width rather than breakpoint-stepped
 * columns: the grid re-flows at whatever width it is given, which matters when
 * the same component sits in a full-width catalogue and a narrower homepage
 * section.
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
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-3 sm:gap-4">
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
