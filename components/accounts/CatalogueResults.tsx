import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublicAccounts } from "@/functions/accounts/getPublicAccounts";
import { getCollectionLevels } from "@/functions/collectionLevels/getCollectionLevels";
import { getRanks } from "@/functions/ranks/getRanks";

import { AccountGrid } from "./AccountGrid";
import { CatalogueShell } from "./CatalogueShell";
import { buildFacets } from "./facets";
import {
  filterSignature,
  hasActiveFilters,
  type CatalogueParams,
} from "./filterParams";

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
 *
 * ## The second catalogue query
 *
 * Two reads of the same table, and both are wanted. The first is the filtered
 * view — ordered and narrowed by Postgres, which is where that work belongs.
 * The second is the whole public catalogue, unfiltered, and it exists so the
 * filter rail can say how many listings each *unchosen* option would return.
 * That number cannot be derived from the filtered set: it is by definition
 * about rows the filters have already excluded. See `facets.ts`.
 *
 * It is a second round trip to a table holding a few dozen rows, both are
 * anonymous reads, and the page is cached — so the honest cost is a few
 * milliseconds once every revalidation window. If the shop ever holds thousands
 * of listings this is the thing to fold into a single aggregate query.
 */
export async function CatalogueResults({ params }: { params: CatalogueParams }) {
  const [catalogue, all, ranks, collectionLevels] = await Promise.all([
    getPublicAccounts(params),
    getPublicAccounts(),
    getRanks(),
    getCollectionLevels(),
  ]);

  const { available, closed } = catalogue;
  const total = available.length + closed.length;
  const filtered = hasActiveFilters(params);

  const facets = buildFacets({
    all: [...all.available, ...all.closed],
    params,
    ranks,
    collectionLevels,
  });

  return (
    <CatalogueShell params={params} facets={facets} resultCount={total}>
      {/* Keyed on the filters, and only this subtree.

          A key here remounts the grid, which is what makes the cards animate
          in rather than being swapped between two frames — a filter change
          that removes two of eight near-identical screenshots is otherwise
          genuinely hard to notice.

          It must not go any higher. Keying the Suspense boundary restarts it on
          every change and remounts everything inside, including the filter
          controls: on a phone that closed the sheet after a single tap, so only
          one filter could be applied per open. Keying here leaves the rail, the
          sheet and the search box untouched. */}
      <div key={filterSignature(params)} className="flex flex-col gap-8">
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
    </CatalogueShell>
  );
}
