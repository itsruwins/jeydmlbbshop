import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getAccounts,
  type AccountSort,
  type GetAccountsOptions,
} from "@/functions/accounts/getAccounts";

import { AccountsTable } from "./AccountsTable";
import { AccountsToolbar } from "./AccountsToolbar";

/**
 * The admin catalogue's data and table.
 *
 * Behind a `<Suspense>` boundary inside the page rather than a segment-level
 * `loading.tsx`, for the same reason as the public catalogue: a `loading.tsx`
 * here would wrap `accounts/[id]/edit` as well, flush the shell before the
 * listing is fetched, and lock the status at 200 — so `notFound()` on a deleted
 * listing would render the right screen under the wrong status code.
 */
export async function AccountsResults({
  options,
  filtered,
}: {
  options: GetAccountsOptions & { sort: AccountSort };
  filtered: boolean;
}) {
  const accounts = await getAccounts(options);

  return (
    <>
      <p className="-mt-3 text-ink-3">
        {accounts.length === 1 ? "1 listing" : `${accounts.length} listings`}
        {filtered ? " matching your filters" : " in the catalogue"}
      </p>

      <AccountsToolbar
        search={options.search ?? ""}
        status={options.status ?? "all"}
        sort={options.sort}
        featured={options.featuredOnly ?? false}
      />

      {accounts.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface">
          {filtered ? (
            <EmptyState
              title="Nothing matches those filters"
              description="Try a different search term, or clear the filters to see the whole catalogue."
              action={
                <Link href="/admin/accounts">
                  <Button variant="secondary">Clear filters</Button>
                </Link>
              }
            />
          ) : (
            <EmptyState
              title="No listings yet"
              description="Add an account with its price, rank and collection level. Once it is saved you can upload the screenshots buyers will see."
              action={
                <Link href="/admin/accounts/new">
                  <Button variant="primary">Create a listing</Button>
                </Link>
              }
            />
          )}
        </div>
      ) : (
        <AccountsTable accounts={accounts} />
      )}
    </>
  );
}
