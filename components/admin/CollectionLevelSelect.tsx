"use client";

import { useMemo } from "react";

import { Select } from "@/components/ui/Select";
import type { CollectionLevel } from "@/types/collectionLevel";

/**
 * Collection level chooser, fed from the `collection_levels` table.
 *
 * Forty-five options is too many for a flat list, so they are grouped by
 * category — the nine collector tiers — which turns "find Exalted Collector II"
 * into two short scans instead of one long one.
 *
 * The options stay in `sort_order`, lowest to highest. Sorting them by name
 * would put Amateur above Galaxy and invert the progression.
 */
export function CollectionLevelSelect({
  id,
  name,
  value,
  levels,
  invalid,
  describedBy,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  levels: CollectionLevel[];
  invalid?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
}) {
  const groups = useMemo(() => {
    const byCategory = new Map<string, CollectionLevel[]>();
    for (const level of levels) {
      const existing = byCategory.get(level.category);
      if (existing) existing.push(level);
      else byCategory.set(level.category, [level]);
    }
    return [...byCategory.entries()];
  }, [levels]);

  return (
    <Select
      id={id}
      name={name}
      value={value}
      invalid={invalid}
      aria-describedby={describedBy}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Choose a collection level…</option>
      {groups.map(([category, items]) => (
        <optgroup key={category} label={category}>
          {items.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}
