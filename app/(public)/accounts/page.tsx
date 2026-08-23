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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-1.5">
        <h1 className="text-[length:var(--text-2xl)] font-semibold tracking-[-0.02em] text-ink">
          Browse accounts
        </h1>
        <p className="text-ink-3">
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
          flight. The skeleton still shows on first load, which is the case it
          was for. */}
      <Suspense fallback={<CatalogueSkeleton />}>
        <CatalogueResults params={params} />
      </Suspense>
    </div>
  );
}
