import { ListingCard } from "./ListingCard";
import type { AccountWithRelations } from "@/types/account";

/**
 * `auto-fill` with a minimum column width rather than breakpoint-stepped
 * columns: the grid re-flows at whatever width it is given, which matters when
 * the same component sits in a 100rem catalogue and a narrower page section.
 *
 * `auto-fill`, specifically, not `auto-fit`. The two differ only when the items
 * do not fill the row, which is the normal case for a shop holding a handful of
 * listings: `auto-fit` collapses the empty tracks, so a single account stretches
 * into one card with a screenshot the size of a billboard. `auto-fill` keeps the
 * tracks, so one listing is a listing and two sit side by side at the width a
 * product tile should be.
 *
 * The minimum is 18rem rather than 17: the card now carries a swing tag and
 * four marked facts, and at 17rem a long collection level ("Renowned Collector
 * V") was truncating on every second card.
 *
 * ## The stagger
 *
 * Each card carries its own delay as an inline custom property rather than the
 * grid carrying a stack of nth-child rules — thirty cards then cost thirty
 * numbers instead of thirty selectors. It is capped at eight steps so the last
 * card in a long grid still arrives inside a third of a second; past that point
 * a stagger stops reading as choreography and starts reading as lag.
 *
 * The animation only runs on mount, which is exactly when it should: the
 * catalogue keys this grid on the active filters, so a filter change remounts
 * it and the new results settle in rather than appearing between two frames.
 */
export function AccountGrid({
  accounts,
  priorityCount = 0,
}: {
  accounts: AccountWithRelations[];
  /** How many leading cards load eagerly. Only the ones above the fold. */
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4 sm:gap-5">
      {accounts.map((account, index) => (
        <li
          key={account.id}
          className="card-in flex"
          style={
            {
              "--card-delay": `${Math.min(index, 8) * 35}ms`,
            } as React.CSSProperties
          }
        >
          <ListingCard
            account={account}
            priority={index < priorityCount}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1600px) 25vw, 20rem"
          />
        </li>
      ))}
    </ul>
  );
}
