import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublicAccounts } from "@/functions/accounts/getPublicAccounts";
import { getCollectionLevels } from "@/functions/collectionLevels/getCollectionLevels";
import { getRanks } from "@/functions/ranks/getRanks";

import { AccountGrid } from "./AccountGrid";
import { MarketplaceFilters } from "./MarketplaceFilters";
import { hasActiveFilters, type CatalogueParams } from "./filterParams";

/**
 * The catalogue's data and results.
 *
 * Split out from the page so it can sit behind a `<Suspense>` boundary *inside*
 * the page rather than in a segment-level `loading.tsx`.
 *
 * That distinction is not stylistic. A `loading.tsx` at `app/(public)/accounts/`
 * wraps the whole segment — including `accounts/[reference]` — and a Suspense
 * boundary above a page flushes the response shell immediately. Once the shell
 * is sent the HTTP status is locked at 200, so a missing listing's `notFound()`
 * rendered the right page under a 200 instead of a 404: a soft 404 on exactly
 * the URLs that get shared on social media and crawled. Keeping the boundary in
 * here means the detail route streams nothing before it knows the answer.
 */
export async function CatalogueResults({ params }: { params: CatalogueParams }) {
  const [catalogue, ranks, collectionLevels] = await Promise.all([
    getPublicAccounts(params),
    getRanks(),
    getCollectionLevels(),
  ]);

  const { available, closed } = catalogue;
  const total = available.length + closed.length;
  const filtered = hasActiveFilters(params);

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
      <div className="contents lg:block">
        <MarketplaceFilters
          params={params}
          ranks={ranks}
          collectionLevels={collectionLevels}
          resultCount={total}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-8 lg:col-start-2 lg:row-start-1">
        {total === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface">
            {filtered ? (
              <EmptyState
                title="No accounts match those filters"
                description="Try widening the price range or clearing a filter — new accounts are listed regularly."
                action={
                  <Link href="/accounts">
                    <Button variant="secondary">Clear filters</Button>
                  </Link>
                }
              />
            ) : (
              <EmptyState
                title="No accounts listed yet"
                description="Nothing is up for sale at the moment. Check back soon, or message us about what you are looking for."
              />
            )}
          </div>
        ) : (
          <>
            {available.length > 0 && (
              <section>
                <h2 className="sr-only">Available accounts</h2>
                <AccountGrid accounts={available} priorityCount={4} />
              </section>
            )}

            {available.length === 0 && closed.length > 0 && (
              <p className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-4 py-3 text-ink-2">
                Nothing matching is available right now — everything below has
                already been sold or reserved.
              </p>
            )}

            {/* Below the available listings and visually quieter, rather than
                interleaved: a buyer should not scroll past things they cannot
                buy to reach the ones they can. */}
            {closed.length > 0 && (
              <section className="flex flex-col gap-4 border-t border-[var(--border)] pt-8">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[length:var(--text-lg)] font-semibold tracking-[-0.005em] text-ink">
                    Sold and reserved
                  </h2>
                  <p className="text-[length:var(--text-sm)] text-ink-3">
                    Recently moved. Message us if you want something similar.
                  </p>
                </div>
                <AccountGrid accounts={closed} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
