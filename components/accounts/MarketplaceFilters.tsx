"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import type { CollectionLevel } from "@/types/collectionLevel";
import type { Rank } from "@/types/rank";

import { FilterControls } from "./FilterControls";
import {
  SORT_OPTIONS,
  countActiveFilters,
  hasActiveFilters,
  type CatalogueParams,
} from "./filterParams";

/**
 * Search, sort and filters for the catalogue.
 *
 * Two intentional layouts. On desktop the filters are a persistent sidebar —
 * there is room, and seeing the active ones without opening anything is worth
 * the space. On mobile they live in a sheet behind a button that shows how many
 * are active, because a phone's screen belongs to the results.
 *
 * All state is the URL. Nothing here holds a filter value of its own except the
 * search box, which is debounced.
 */
export function MarketplaceFilters({
  params,
  ranks,
  collectionLevels,
  resultCount,
}: {
  params: CatalogueParams;
  ranks: Rank[];
  collectionLevels: CollectionLevel[];
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const [term, setTerm] = useState(params.search);

  // Follow the URL when it changes from outside — a shared link, Back, or
  // "Clear all". Adjusting during render rather than in an effect avoids the
  // extra pass an effect would cost.
  const [syncedSearch, setSyncedSearch] = useState(params.search);
  if (syncedSearch !== params.search) {
    setSyncedSearch(params.search);
    setTerm(params.search);
  }

  const push = (next: CatalogueParams) => {
    const query = new URLSearchParams();

    if (next.search) query.set("q", next.search);
    for (const id of next.rankIds) query.append("rank", id);
    if (next.minPrice !== undefined) query.set("min_price", String(next.minPrice));
    if (next.maxPrice !== undefined) query.set("max_price", String(next.maxPrice));
    if (next.minCollectionSort !== undefined)
      query.set("min_collection", String(next.minCollectionSort));
    if (next.minSkins !== undefined)
      query.set("min_skins", String(next.minSkins));
    if (next.sort !== "newest") query.set("sort", next.sort);

    const search = query.toString();
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    });
  };

  const change = (patch: Partial<CatalogueParams>) =>
    push({ ...params, ...patch });

  // Debounced so typing five letters is one request rather than five.
  useEffect(() => {
    if (term.trim() === params.search) return;
    const timer = window.setTimeout(
      () => push({ ...params, search: term.trim() }),
      300,
    );
    return () => window.clearTimeout(timer);
    // `push` and `params` are rebuilt each render by design; including them
    // would re-arm the timer continuously and it would never fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, params.search]);

  // Collapse the 45 levels to their nine tier heads — "Exalted Collector and
  // above" is the question a buyer actually has, and a 45-option list is not.
  const categories = collectionLevels.reduce<
    Array<{ label: string; sortOrder: number }>
  >((acc, level) => {
    if (!acc.some((entry) => entry.label === level.category)) {
      acc.push({ label: level.category, sortOrder: level.sort_order });
    }
    return acc;
  }, []);

  const activeCount = countActiveFilters(params);
  const anyActive = hasActiveFilters(params);

  const clearAll = () =>
    push({
      search: "",
      rankIds: [],
      minPrice: undefined,
      maxPrice: undefined,
      minCollectionSort: undefined,
      minSkins: undefined,
      sort: params.sort,
    });

  return (
    <>
      {/* Search and sort: always visible at every size. */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="catalogue-search" className="sr-only">
            Search accounts
          </label>
          <Input
            id="catalogue-search"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search by reference"
            className="pr-9"
          />
          {pending && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3">
              <Spinner />
            </span>
          )}
        </div>

        <div className="flex gap-2.5">
          <div className="flex-1 sm:w-48 sm:flex-none">
            <label htmlFor="catalogue-sort" className="sr-only">
              Sort accounts
            </label>
            <Select
              id="catalogue-sort"
              value={params.sort}
              onChange={(event) =>
                change({ sort: event.target.value as CatalogueParams["sort"] })
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Sheet trigger, mobile only. */}
          <Button
            variant="secondary"
            className="lg:hidden"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(true)}
          >
            Filters
            {activeCount > 0 && (
              <span className="tabular ml-1 inline-flex size-5 items-center justify-center rounded-full bg-accent text-[length:var(--text-xs)] font-medium text-on-accent">
                {activeCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-medium text-ink">Filters</h2>
            {anyActive && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[length:var(--text-sm)] text-accent-ink underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <FilterControls
            params={params}
            ranks={ranks}
            collectionCategories={categories}
            onChange={change}
          />
        </div>
      </aside>

      {/* Mobile sheet */}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        resultCount={resultCount}
        anyActive={anyActive}
        onClear={clearAll}
      >
        <FilterControls
          params={params}
          ranks={ranks}
          collectionCategories={categories}
          onChange={change}
        />
      </FilterSheet>
    </>
  );
}

/**
 * A bottom sheet on a phone, because that is where a thumb is.
 *
 * Enters and leaves along the same path — up from the bottom, back down — so
 * the gesture and the animation agree about where the panel lives.
 */
function FilterSheet({
  open,
  onClose,
  resultCount,
  anyActive,
  onClear,
  children,
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  anyActive: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      className={cn(
        "m-0 mt-auto w-full max-w-none rounded-t-[var(--radius-lg)] p-0 lg:hidden",
        "max-h-[85dvh] border-t border-[var(--border)] bg-surface text-ink",
        "shadow-[var(--shadow-dialog)] backdrop:bg-[var(--scrim)]",
        "motion-safe:animate-[sheet-up_var(--dur-slow)_var(--ease-out)]",
      )}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <h2 className="font-semibold text-ink">Filters</h2>
          {anyActive && (
            <button
              type="button"
              onClick={onClear}
              className="text-[length:var(--text-sm)] text-accent-ink underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          {children}
        </div>

        <div className="border-t border-[var(--border)] p-4">
          <Button variant="primary" className="w-full" onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? "account" : "accounts"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
