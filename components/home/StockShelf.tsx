import { ListingCard } from "@/components/accounts/ListingCard";
import type { AccountWithRelations } from "@/types/account";

/**
 * Everything available, as a shelf of products.
 *
 * ## The column count is the whole trick
 *
 * A fixed three-column grid, not `auto-fit` or `auto-fill`. The columns exist
 * whether or not there is anything to put in them, so one account occupies one
 * column and sits at the left under the heading — it stays the size of a
 * product. `auto-fit` collapses the empty tracks and hands a single listing the
 * entire width, which is how it ended up looking like a billboard; a sideways
 * rail solved that but left 40% of the row empty at three listings, because a
 * rail is built to overflow and this shop does not have enough stock to
 * overflow one yet. Three columns fills the row exactly at today's inventory
 * and wraps to a second row as it grows.
 *
 * ## The tile is not defined here any more
 *
 * It used to be, and the catalogue defined its own beside it. The two were the
 * same idea drawn twice and they drifted, so a buyer tapping through from the
 * storefront met a listing that looked like a different shop's. Both are now
 * `ListingCard` — see the note there for why the tile's version of each
 * decision is the one that survived. What is left in this file is the only
 * thing that was ever really the shelf's own: how many of them stand in a row.
 */
export function StockShelf({ accounts }: { accounts: AccountWithRelations[] }) {
  if (accounts.length === 0) return null;

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <li key={account.id} className="flex">
          <ListingCard
            account={account}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24rem"
          />
        </li>
      ))}
    </ul>
  );
}
