import { Suspense } from "react";
import type { Metadata } from "next";

import { CatalogueResults } from "@/components/accounts/CatalogueResults";
import { CatalogueSkeleton } from "@/components/accounts/CatalogueSkeleton";
import { readCatalogueParams } from "@/components/accounts/filterParams";

export const metadata: Metadata = {
  title: "Browse accounts",
  description:
    "Every Mobile Legends account currently listed, with rank, collection level, skin count and screenshots.",
};

export default async function AccountsPage({
  searchParams,
}: PageProps<"/accounts">) {
  const params = readCatalogueParams(await searchParams);

  return (
    /* `data-shell="wide"` widens the measure for this page *and* for the header
       and footer above and below it — see `.shell` in globals.css for how, and
       why it is a marker on the page rather than a route check in the header.

       This is the one page that asks for it. A catalogue is a grid of products
       and a grid wants columns: at the site's usual 72rem the filter rail and
       two cards filled the row, and a third of a desktop viewport stayed black
       on either side. The same page at 100rem runs four columns beside the
       rail, which is the difference between browsing a shop and scrolling a
       list. */
    <div
      data-shell="wide"
      className="shell px-4 py-8 sm:px-6 sm:py-10 lg:py-12"
    >
      <header className="mb-7 flex flex-col gap-1.5">
        <h1 className="display text-[length:var(--display-2)] text-ink">
          Browse accounts
        </h1>
        <p className="text-[length:var(--text-md)] text-ink-3">
          Rank, collection level and skin count on every listing.
        </p>
      </header>

      {/* Deliberately un-keyed.

          Keying this on the filters restarts the boundary on every change,
          which remounts everything inside it — including the filter controls
          themselves. On a phone that closed the filter sheet after a single
          tap, so only one filter could be applied per open.

          Without the key, a filter change is an update rather than a mount:
          the current results stay on screen while the new ones load, the sheet
          stays open, and the toolbar's own spinner reports that work is in
          flight. The results grid *is* keyed, one level down in
          `CatalogueResults`, which is where a remount costs nothing and buys
          the entrance animation. The skeleton still shows on first load, which
          is the case it was for. */}
      <Suspense fallback={<CatalogueSkeleton />}>
        <CatalogueResults params={params} />
      </Suspense>
    </div>
  );
}
