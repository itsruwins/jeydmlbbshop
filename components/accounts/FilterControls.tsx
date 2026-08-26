"use client";

import { useId, useState } from "react";

import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";

import type { CatalogueFacets, FacetOption, PriceFacet } from "./facets";
import type { CatalogueParams } from "./filterParams";

/**
 * The filter rail, with no opinion about where it lives.
 *
 * The catalogue renders this twice — in the desktop sidebar and inside the
 * mobile sheet — so the two can never drift apart. Everything is controlled by
 * the parent, which owns the URL.
 *
 * ## Everything here reports, not just accepts
 *
 * The previous version was a column of checkboxes, two number boxes, a native
 * select and four chips: a rail that could take an instruction and had nothing
 * to say back. Narrowing was therefore guesswork with a penalty — tick a rank,
 * wait, find an empty page, back out. Every control here carries the count it
 * would return (see `facets.ts` for why those numbers are computed the way they
 * are), and an option that would return nothing is shown as spent rather than
 * offered.
 *
 * ## Why two ladders and not two lists
 *
 * Rank and collection level are both *ordered* — Grandmaster below Mythic below
 * Immortal; Amateur Collector below Galaxy — and a control for an ordered thing
 * should look ordered. A flat column of checkboxes says these are seven
 * unrelated categories, which is why the collection filter needed the words
 * "and above" on every row to explain itself. On a ladder the threshold is
 * visible: everything above the chosen rung is lit, so the rail shows what the
 * selection includes instead of describing it.
 */
export function FilterControls({
  params,
  facets,
  onChange,
}: {
  params: CatalogueParams;
  facets: CatalogueFacets;
  onChange: (next: Partial<CatalogueParams>) => void;
}) {
  const toggleRank = (id: string) => {
    const next = params.rankIds.includes(id)
      ? params.rankIds.filter((value) => value !== id)
      : [...params.rankIds, id];
    onChange({ rankIds: next });
  };

  return (
    <div className="flex flex-col gap-7">
      <Group label="Rank">
        <ul className="flex flex-col">
          {facets.ranks.map((option, index) => (
            <Rung
              key={option.value}
              option={option}
              first={index === 0}
              last={index === facets.ranks.length - 1}
              selected={params.rankIds.includes(option.value)}
              onSelect={() => toggleRank(option.value)}
            />
          ))}
        </ul>
      </Group>

      <Group label="Price">
        <PriceRange
          facet={facets.price}
          minPrice={params.minPrice}
          maxPrice={params.maxPrice}
          onChange={onChange}
        />
      </Group>

      <Group label="Collection level">
        {/* A floor, not a range. Collection level is a ladder and buyers filter
            by a minimum on it — an upper bound would be asking for an account
            that is worse. */}
        <ul className="flex flex-col">
          {facets.collections.map((option, index) => {
            const sortOrder = Number(option.value);
            const chosen = params.minCollectionSort;
            return (
              <Rung
                key={option.value}
                option={option}
                first={index === 0}
                last={index === facets.collections.length - 1}
                selected={chosen === sortOrder}
                // Everything at or above the chosen rung is part of the
                // selection. Lighting those rungs is what makes "and above"
                // legible without writing the words on all nine rows.
                included={chosen !== undefined && sortOrder >= chosen}
                onSelect={() =>
                  onChange({
                    minCollectionSort:
                      chosen === sortOrder ? undefined : sortOrder,
                  })
                }
              />
            );
          })}
        </ul>
      </Group>

      <Group label="Skins">
        {/* Chips, not a fifth ladder. These are four arbitrary round numbers
            rather than rungs of a real progression, and at four options a row
            of targets is faster to hit than a column. */}
        <div className="flex flex-wrap gap-2">
          {facets.skins.map(({ value, count }) => {
            const active = params.minSkins === value;
            const spent = count === 0 && !active;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                disabled={spent}
                onClick={() => onChange({ minSkins: active ? undefined : value })}
                className={cn(
                  "tabular inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5",
                  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                  active
                    ? "border-accent bg-accent-soft font-medium text-accent-ink"
                    : "border-[var(--border-strong)] text-ink-2 hover:border-ink-3 hover:text-ink",
                  spent && "opacity-45 hover:border-[var(--border-strong)]",
                )}
              >
                {value}+
                <span
                  className={cn(
                    "text-[length:var(--text-xs)]",
                    active ? "text-accent-ink" : "text-ink-3",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Group>
    </div>
  );
}

/**
 * One rung of a ladder: a connector, a node, a label and a count.
 *
 * `aria-pressed` rather than a checkbox or a radio because both ladders behave
 * the same way to a keyboard — press to add, press again to remove — while
 * their underlying semantics differ (rank is a multi-select, collection level
 * is a single threshold). A toggle button is honest about the interaction in
 * both cases; a radio group would promise the collection ladder cannot be
 * cleared, which it can.
 *
 * A rung with nothing behind it is `disabled`, not hidden. Seven ranks that
 * become four as you filter is a rail that moves under the pointer, and the
 * empty ones are information: this shop has no Grandmaster accounts right now.
 */
function Rung({
  option,
  first,
  last,
  selected,
  included = false,
  onSelect,
}: {
  option: FacetOption;
  first: boolean;
  last: boolean;
  selected: boolean;
  /** Above the chosen threshold on a ladder that has one. */
  included?: boolean;
  onSelect: () => void;
}) {
  const lit = selected || included;
  const spent = option.count === 0 && !selected;

  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        disabled={spent}
        onClick={onSelect}
        className={cn(
          "flex w-full min-h-11 items-stretch gap-2.5 rounded-[var(--radius)] pr-2.5 text-left",
          "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
          selected ? "bg-accent-soft" : "hover:bg-surface-3",
          spent && "opacity-45 hover:bg-transparent",
        )}
      >
        {/* The rail. The connector is clipped at the node on the first and last
            rungs so the ladder starts and ends on a rung rather than trailing a
            line into the padding. */}
        <span
          aria-hidden="true"
          className="relative flex w-6 shrink-0 items-center justify-center"
        >
          <span
            className={cn(
              "absolute left-1/2 w-px -translate-x-1/2 bg-[var(--border)]",
              first ? "top-1/2 bottom-0" : last ? "top-0 bottom-1/2" : "inset-y-0",
            )}
          />
          <span
            className={cn(
              "relative size-2 rounded-full transition-colors duration-[var(--dur-fast)]",
              lit ? "bg-accent" : "bg-[var(--border-strong)]",
              selected && "ring-2 ring-accent/35",
            )}
          />
        </span>

        <span
          className={cn(
            "flex-1 self-center truncate",
            lit ? "font-medium text-ink" : "text-ink-2",
          )}
        >
          {option.label}
        </span>

        <span
          className={cn(
            "tabular self-center text-[length:var(--text-xs)]",
            selected ? "text-accent-ink" : "text-ink-3",
          )}
        >
          {option.count}
        </span>
      </button>
    </li>
  );
}

/**
 * A two-ended price filter: a slider over the catalogue's range, and boxes.
 *
 * ## Why the slider is there
 *
 * Two empty boxes labelled Min and Max ask a buyer for a number they have no
 * way to choose. Nothing on the page says whether this shop sells at ₱800 or
 * ₱80,000, so the honest answers are "nothing" and "a number I made up", and a
 * made-up number is how you get an empty page. The track answers the question
 * the boxes were asking — it runs from the cheapest account to the dearest, and
 * the prices printed under the handles name where you currently are.
 *
 * ## Why the boxes stayed
 *
 * A slider is for exploring and is bad at precision: it snaps to round steps
 * and it cannot be told "under nine thousand" without dragging. A buyer with a
 * fixed budget has an exact number in mind. So the two coexist — the slider
 * moves the boxes, the boxes move the slider, and neither is the only way in.
 * The boxes are also the fallback where the range collapses: one listing, or
 * ten at the same price, gives a slider no distance to travel and it is not
 * drawn at all.
 */
function PriceRange({
  facet,
  minPrice,
  maxPrice,
  onChange,
}: {
  facet: PriceFacet | null;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onChange: (next: Partial<CatalogueParams>) => void;
}) {
  const id = useId();

  /* The handles are local state, not the URL.

     A range input fires `change` on every step of a drag, and pushing each one
     would be a request per pixel and a URL that flickers through forty values.
     So the drag is local and only the release commits — `onPointerUp` and
     `onKeyUp`, which between them cover a mouse, a thumb and the arrow keys. */
  const [drag, setDrag] = useState<{ min: number; max: number } | null>(null);

  if (!facet || facet.max <= facet.min) {
    return (
      <PriceBoxes
        idPrefix={id}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onChange={onChange}
      />
    );
  }

  const low = drag?.min ?? minPrice ?? facet.min;
  const high = drag?.max ?? maxPrice ?? facet.max;
  const span = facet.max - facet.min;
  const pct = (value: number) => ((value - facet.min) / span) * 100;

  /* At rest the handles sit at the two ends and *everything* is in range, so
     painting "in range" with the accent lit the whole strip and the whole
     track — the loudest thing in the rail, saying nothing, on a filter nobody
     had touched. The accent means interactive state everywhere else on this
     site, so it waits here until there is some: a committed price, or a drag
     in progress. Until then the control is drawn in the neutral ramp. */
  const narrowed =
    drag !== null || minPrice !== undefined || maxPrice !== undefined;

  const commit = () => {
    if (!drag) return;
    onChange({
      // A handle parked at the end of the track is not a filter — it is the
      // absence of one, and writing `?min_price=2500` into the URL for it would
      // light up "Clear all" over a view that is not narrowed at all.
      minPrice: drag.min <= facet.min ? undefined : drag.min,
      maxPrice: drag.max >= facet.max ? undefined : drag.max,
    });
    setDrag(null);
  };

  const move = (end: "min" | "max", raw: number) => {
    const value = Math.round(raw);
    setDrag(
      end === "min"
        ? { min: Math.min(value, high), max: high }
        : { min: low, max: Math.max(value, low) },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="range-stack relative h-5">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface-3"
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 h-1 -translate-y-1/2 rounded-full transition-colors duration-[var(--dur-fast)]",
            narrowed ? "bg-accent" : "bg-[var(--border-strong)]",
          )}
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />

        <input
          type="range"
          aria-label="Lowest price shown"
          min={facet.min}
          max={facet.max}
          step={facet.step}
          value={low}
          onChange={(event) => move("min", Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
        />
        <input
          type="range"
          aria-label="Highest price shown"
          min={facet.min}
          max={facet.max}
          step={facet.step}
          value={high}
          onChange={(event) => move("max", Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
        />
      </div>

      {/* Reads the handles live during a drag, which is the only feedback a
          slider with no printed scale can give. */}
      <p
        aria-hidden="true"
        className="tabular flex items-center justify-between text-[length:var(--text-xs)] text-ink-3"
      >
        <span className={low > facet.min ? "text-accent-ink" : undefined}>
          {formatPrice(low)}
        </span>
        <span className={high < facet.max ? "text-accent-ink" : undefined}>
          {formatPrice(high)}
        </span>
      </p>

      <PriceBoxes
        idPrefix={id}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onChange={onChange}
      />
    </div>
  );
}

function PriceBoxes({
  idPrefix,
  minPrice,
  maxPrice,
  onChange,
}: {
  /** Per-instance, from `useId`: the rail is rendered twice on the same page
      (desktop sidebar and mobile sheet) and two inputs cannot share an id. */
  idPrefix: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onChange: (next: Partial<CatalogueParams>) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <PriceInput
        id={`${idPrefix}-min`}
        label="Minimum price"
        placeholder="Min"
        value={minPrice}
        onCommit={(value) => onChange({ minPrice: value })}
      />
      <span aria-hidden="true" className="text-ink-3">
        –
      </span>
      <PriceInput
        id={`${idPrefix}-max`}
        label="Maximum price"
        placeholder="Max"
        value={maxPrice}
        onCommit={(value) => onChange({ maxPrice: value })}
      />
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
      <legend className="mb-1.5 text-[length:var(--text-sm)] font-medium tracking-[0.005em] text-ink-3">
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
        // (the slider, Clear all, a shared link), so an uncontrolled field
        // cannot go stale.
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
