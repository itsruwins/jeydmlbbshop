"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";

import { FilterControls } from "./FilterControls";
import type { CatalogueFacets } from "./facets";
import {
  SORT_OPTIONS,
  clearedFilters,
  countActiveFilters,
  hasActiveFilters,
  toSearchParams,
  type CatalogueParams,
} from "./filterParams";

/**
 * The catalogue's frame: search, sort, the filter rail, and the results.
 *
 * ## Why the results are passed in rather than fetched here
 *
 * `children` is the server-rendered grid. This component is the client half of
 * the page — it owns the URL, the transition and the sheet — and it wraps a
 * tree it never renders itself. That is what lets the grid stay a server
 * component: the cards, their queries and their image work never reach the
 * browser bundle, and this file ships only the controls.
 *
 * It also means the pending state can be *shown on the results*, which is the
 * only place it is useful. A spinner in the toolbar tells you something is
 * happening; dimming the grid tells you which thing is about to be replaced.
 *
 * ## All state is the URL
 *
 * Nothing here holds a filter value of its own except the search box, which is
 * debounced, and the price handles mid-drag. Filters live in the URL so a
 * filtered view can be linked, bookmarked and shared — which matters most for
 * the person running the shop, who can post "Mythic accounts under ₱10,000"
 * straight to social media as a working link.
 *
 * ## Two layouts, on purpose
 *
 * On desktop the rail is a persistent sidebar: there is room, and seeing the
 * active filters without opening anything is worth the space. On a phone it is
 * a sheet behind a button that reports how many are active, because a phone's
 * screen belongs to the results.
 */
export function CatalogueShell({
  params,
  facets,
  resultCount,
  children,
}: {
  params: CatalogueParams;
  facets: CatalogueFacets;
  resultCount: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchId = useId();

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
    const search = toSearchParams(next).toString();
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

  const activeCount = countActiveFilters(params);
  const anyActive = hasActiveFilters(params);
  const clearAll = () => push(clearedFilters(params));

  const rail = (
    <FilterControls params={params} facets={facets} onChange={change} />
  );

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      {/* Desktop sidebar.

          `items-start` on the grid is what lets this stick at all — a stretched
          grid item is already as tall as its row and has nowhere to travel.

          The height cap and its own scrollbar are not decoration. Four groups,
          seven ranks and nine collector tiers make a rail taller than a laptop
          viewport, and a sticky element taller than the space it is stuck in
          pins its top and puts its bottom permanently off-screen: the Skins
          filter existed and could not be reached. Capping it to the viewport
          and letting it scroll inside itself is what keeps every control
          available at any window height. `overscroll-contain` stops that scroll
          from continuing into the page once the rail hits its end. */}
      <aside className="sticky top-20 hidden max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] lg:block">
        <div className="flex flex-col gap-5">
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
          {rail}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-5">
        {/* Search and sort: always visible at every size.

            The search box is sized to what goes in it — a reference is a
            handful of characters — rather than stretched across the row. Run
            full width above a four-column grid it read as the page's main
            event, which it is not; the grid is. Sort sits directly beside it:
            they are one toolbar and the eye should read them as one. Pushed to
            opposite ends of a wide row they became two unrelated controls with
            a lake of dead space between them. */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative sm:w-72">
            <label htmlFor={searchId} className="sr-only">
              Search accounts
            </label>
            <Input
              id={searchId}
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

          <div className="flex gap-2.5 sm:flex-1 sm:gap-3">
            <div className="flex-1 sm:w-52 sm:flex-none">
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

            {/* Sheet trigger, mobile only. `ml-auto` sends it to the far end
                of the toolbar, which is the one control that belongs there. */}
            <Button
              variant="secondary"
              className="ml-auto lg:hidden"
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

        <ActiveFilters
          params={params}
          facets={facets}
          resultCount={resultCount}
          onChange={change}
          onClear={clearAll}
        />

        {/* The results, and the only honest place to report that new ones are
            on the way. `aria-busy` says the same thing to a screen reader,
            which cannot see the dimming. */}
        <div
          aria-busy={pending || undefined}
          className={cn(
            "transition-opacity duration-[var(--dur)] ease-[var(--ease-out)]",
            pending && "opacity-55",
          )}
        >
          {children}
        </div>
      </div>

      {/* Mobile sheet */}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        resultCount={resultCount}
        anyActive={anyActive}
        onClear={clearAll}
      >
        {rail}
      </FilterSheet>
    </div>
  );
}

/**
 * What is currently narrowing the catalogue, as a row of things you can take
 * off again.
 *
 * ## Why this exists next to a rail that already shows the same state
 *
 * It does not, on a phone — the rail is behind a button there, and a badge
 * reading "3" names none of the three. And on desktop the rail shows the state
 * only while you are looking at it; this row sits directly above the results,
 * which is where someone is looking when they wonder why there are four of
 * them.
 *
 * The important part is that each token is removable on its own. "Clear all"
 * is the only undo a rail offers, so backing out of one bad guess means
 * rebuilding every other filter by hand — and the usual response to that is to
 * clear everything and start over.
 *
 * Price is deliberately one token rather than two. A minimum and a maximum are
 * one thought, and splitting them produces "from ₱2,000" beside "to ₱5,000" as
 * though they were unrelated decisions.
 */
function ActiveFilters({
  params,
  facets,
  resultCount,
  onChange,
  onClear,
}: {
  params: CatalogueParams;
  facets: CatalogueFacets;
  resultCount: number;
  onChange: (next: Partial<CatalogueParams>) => void;
  onClear: () => void;
}) {
  const tokens: Array<{ key: string; label: string; remove: () => void }> = [];

  if (params.search) {
    tokens.push({
      key: "search",
      label: `“${params.search}”`,
      remove: () => onChange({ search: "" }),
    });
  }

  for (const id of params.rankIds) {
    const rank = facets.ranks.find((option) => option.value === id);
    if (!rank) continue;
    tokens.push({
      key: `rank-${id}`,
      label: rank.label,
      remove: () =>
        onChange({ rankIds: params.rankIds.filter((value) => value !== id) }),
    });
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const { minPrice, maxPrice } = params;
    tokens.push({
      key: "price",
      label:
        minPrice !== undefined && maxPrice !== undefined
          ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
          : minPrice !== undefined
            ? `From ${formatPrice(minPrice)}`
            : `Up to ${formatPrice(maxPrice)}`,
      remove: () => onChange({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (params.minCollectionSort !== undefined) {
    const tier = facets.collections.find(
      (option) => Number(option.value) === params.minCollectionSort,
    );
    tokens.push({
      key: "collection",
      label: tier ? `${tier.label} and above` : "Collection level",
      remove: () => onChange({ minCollectionSort: undefined }),
    });
  }

  if (params.minSkins !== undefined) {
    tokens.push({
      key: "skins",
      label: `${params.minSkins}+ skins`,
      remove: () => onChange({ minSkins: undefined }),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--border)] pb-4">
      <p className="text-[length:var(--text-sm)] text-ink-3">
        {/* Keyed on the number so the span remounts and replays the lift. A
            total that changes in place is the easiest thing on the page to
            miss, and it is the page's only confirmation that a filter did
            anything at all. */}
        <span
          key={resultCount}
          className="count-roll tabular mr-1 inline-block font-medium text-ink"
        >
          {resultCount}
        </span>
        {resultCount === 1 ? "account" : "accounts"}
      </p>

      {tokens.length > 0 && (
        <>
          <span aria-hidden="true" className="h-4 w-px bg-[var(--border)]" />

          <ul className="flex flex-wrap items-center gap-2">
            {tokens.map((token) => (
              <li key={token.key}>
                <button
                  type="button"
                  onClick={token.remove}
                  className={cn(
                    "hit-target inline-flex h-8 items-center gap-1.5 rounded-full border pl-3 pr-2.5",
                    "border-accent-border bg-accent-soft text-[length:var(--text-sm)] text-accent-ink",
                    "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:border-accent",
                  )}
                >
                  {/* The label alone would announce as "Mythic", which sounds
                      like a filter you can apply rather than one you can take
                      off. */}
                  <span className="sr-only">Remove filter:</span>
                  {token.label}
                  <span aria-hidden="true" className="text-[length:var(--text-md)] leading-none">
                    ×
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onClear}
            className="text-[length:var(--text-sm)] text-ink-3 underline-offset-2 hover:text-ink hover:underline"
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}

/**
 * A bottom sheet on a phone, because that is where a thumb is.
 *
 * Enters and leaves along the same path — up from the bottom, back down — so
 * the gesture and the animation agree about where the panel lives.
 *
 * The rail is only mounted while the sheet is open. Rendering it permanently
 * would put a second copy of every control in the document at all times, which
 * duplicates their labels for a screen reader and their `id`s for the HTML —
 * on a page whose desktop sidebar is already rendering the same set.
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
          {open ? children : null}
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
