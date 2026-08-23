"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import type { Rank } from "@/types/rank";

import { SKIN_STEPS, type CatalogueParams } from "./filterParams";

/**
 * The filter controls themselves, with no opinion about where they live.
 *
 * The catalogue renders this twice — in a desktop sidebar and inside the mobile
 * sheet — so the two can never drift apart. Everything is a controlled input
 * driven by the parent, which owns the URL.
 */
export function FilterControls({
  params,
  ranks,
  collectionCategories,
  onChange,
}: {
  params: CatalogueParams;
  ranks: Rank[];
  /** One entry per collector tier, keyed by its lowest sort_order. */
  collectionCategories: Array<{ label: string; sortOrder: number }>;
  onChange: (next: Partial<CatalogueParams>) => void;
}) {
  const toggleRank = (id: string) => {
    const next = params.rankIds.includes(id)
      ? params.rankIds.filter((value) => value !== id)
      : [...params.rankIds, id];
    onChange({ rankIds: next });
  };

  return (
    <div className="flex flex-col gap-6">
      <Group label="Rank">
        {/* Checkboxes, not a multi-select: on a phone every option is one tap
            and all seven are visible at once. */}
        <ul className="flex flex-col gap-0.5">
          {ranks.map((rank) => {
            const checked = params.rankIds.includes(rank.id);
            return (
              <li key={rank.id}>
                <label
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[var(--radius)] px-2 py-1.5",
                    "transition-colors duration-[var(--dur-fast)] hover:bg-surface-3",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRank(rank.id)}
                    className="size-4 shrink-0 accent-[var(--accent)]"
                  />
                  <span className={checked ? "text-ink" : "text-ink-2"}>
                    {rank.name}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group label="Price">
        <div className="flex items-center gap-2">
          <PriceInput
            id="min-price"
            label="Minimum price"
            placeholder="Min"
            value={params.minPrice}
            onCommit={(value) => onChange({ minPrice: value })}
          />
          <span aria-hidden="true" className="text-ink-3">
            –
          </span>
          <PriceInput
            id="max-price"
            label="Maximum price"
            placeholder="Max"
            value={params.maxPrice}
            onCommit={(value) => onChange({ maxPrice: value })}
          />
        </div>
      </Group>

      <Group label="Collection level">
        <label htmlFor="min-collection" className="sr-only">
          Minimum collection level
        </label>
        {/* A single "and above" threshold rather than two ends of a range.
            Collection level is a ladder, and buyers filter by a floor on it —
            an upper bound would be asking for an account that is worse. */}
        <Select
          id="min-collection"
          value={params.minCollectionSort?.toString() ?? ""}
          onChange={(event) =>
            onChange({
              minCollectionSort: event.target.value
                ? Number(event.target.value)
                : undefined,
            })
          }
        >
          <option value="">Any collection level</option>
          {collectionCategories.map((category) => (
            <option key={category.sortOrder} value={category.sortOrder}>
              {category.label} and above
            </option>
          ))}
        </Select>
      </Group>

      <Group label="Skins">
        <div className="flex flex-wrap gap-2">
          {SKIN_STEPS.map((step) => {
            const active = params.minSkins === step;
            return (
              <button
                key={step}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({ minSkins: active ? undefined : step })
                }
                className={cn(
                  "tabular min-h-11 rounded-full border px-3.5",
                  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                  active
                    ? "border-accent bg-accent-soft font-medium text-accent-ink"
                    : "border-[var(--border-strong)] text-ink-2 hover:border-ink-3 hover:text-ink",
                )}
              >
                {step}+
              </button>
            );
          })}
        </div>
      </Group>
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-1 text-[length:var(--text-sm)] font-medium tracking-[0.005em] text-ink-3">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * Commits on blur and on Enter rather than on every keystroke: a price typed
 * digit by digit would otherwise fire a query for "1", "10", "100"…
 */
function PriceInput({
  id,
  label,
  placeholder,
  value,
  onCommit,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: number | undefined;
  onCommit: (value: number | undefined) => void;
}) {
  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return onCommit(undefined);
    const parsed = Number.parseInt(trimmed.replace(/[^\d]/g, ""), 10);
    onCommit(Number.isFinite(parsed) ? parsed : undefined);
  };

  return (
    <div className="relative flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[length:var(--text-sm)] text-ink-3"
      >
        ₱
      </span>
      <Input
        id={id}
        inputMode="numeric"
        placeholder={placeholder}
        defaultValue={value ?? ""}
        // `key` re-mounts the input when the URL value changes from elsewhere
        // (Clear all, a shared link), so an uncontrolled field cannot go stale.
        key={`${id}-${value ?? ""}`}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit(event.currentTarget.value);
          }
        }}
        className="tabular pl-6"
      />
    </div>
  );
}
