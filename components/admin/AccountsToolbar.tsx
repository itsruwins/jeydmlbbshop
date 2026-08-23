"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { ACCOUNT_STATUSES, STATUS_LABELS } from "@/types/account";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_desc", label: "Price, high to low" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "reference", label: "Reference" },
] as const;

/**
 * Search, filter and sort, held in the URL rather than in component state.
 *
 * That makes a filtered view something you can bookmark, reload and link to —
 * which is what makes the dashboard figures able to deep-link into this screen.
 * It also means the filtering happens on the server, so the browser never holds
 * the whole table just to hide most of it.
 */
export function AccountsToolbar({
  search,
  status,
  sort,
  featured,
}: {
  search: string;
  status: string;
  sort: string;
  featured: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [term, setTerm] = useState(search);

  // When the URL's search term changes from outside this component — a link
  // from the dashboard, the Back button — the input has to follow it. React
  // does this by adjusting state during render rather than in an effect, which
  // avoids the extra render pass an effect would cost.
  const [syncedSearch, setSyncedSearch] = useState(search);
  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setTerm(search);
  }

  const apply = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  // Debounced so a five-letter search is one request, not five. `replace`
  // rather than `push` keeps Back going to the previous screen instead of
  // walking backwards through every keystroke.
  useEffect(() => {
    // Already in the URL: either the person has not typed yet, or this run is
    // the echo of the navigation the previous run caused.
    if (term.trim() === search) return;

    const timer = window.setTimeout(() => {
      apply((next) => {
        if (term.trim()) next.set("q", term.trim());
        else next.delete("q");
      });
    }, 250);

    return () => window.clearTimeout(timer);
    // `apply` is recreated on every render by design; listing it here would
    // re-arm the timer continuously and the debounce would never fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, search]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <label htmlFor="account-search" className="sr-only">
          Search listings
        </label>
        <Input
          id="account-search"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search reference or title"
          className="pr-9"
        />
        {pending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3">
            <Spinner />
          </span>
        )}
      </div>

      <div className="flex flex-1 gap-3">
        <div className="flex-1 sm:max-w-[10rem]">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <Select
            id="status-filter"
            value={status}
            onChange={(event) =>
              apply((next) => {
                const value = event.target.value;
                if (value === "all") next.delete("status");
                else next.set("status", value);
              })
            }
          >
            <option value="all">All statuses</option>
            {ACCOUNT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1 sm:max-w-[12rem]">
          <label htmlFor="sort-order" className="sr-only">
            Sort listings
          </label>
          <Select
            id="sort-order"
            value={sort}
            onChange={(event) =>
              apply((next) => {
                const value = event.target.value;
                if (value === "newest") next.delete("sort");
                else next.set("sort", value);
              })
            }
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <label className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-[var(--border-strong)] bg-surface px-3 transition-colors hover:border-ink-3">
        <input
          type="checkbox"
          checked={featured}
          onChange={(event) =>
            apply((next) => {
              if (event.target.checked) next.set("featured", "1");
              else next.delete("featured");
            })
          }
          className="size-4 accent-[var(--accent)]"
        />
        <span className="text-[length:var(--text-sm)] text-ink-2">Featured</span>
      </label>
    </div>
  );
}
