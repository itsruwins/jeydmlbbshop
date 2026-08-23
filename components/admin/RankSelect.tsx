"use client";

import { Select } from "@/components/ui/Select";
import type { Rank } from "@/types/rank";

/**
 * Rank chooser, fed from the `ranks` table.
 *
 * Options are never hardcoded — this marketplace uses seven tiers
 * (Grandmaster through Mythical Immortal) and the list lives in the database,
 * so the form cannot offer something the database will reject.
 */
export function RankSelect({
  id,
  name,
  value,
  ranks,
  invalid,
  describedBy,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  ranks: Rank[];
  invalid?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      id={id}
      name={name}
      value={value}
      invalid={invalid}
      aria-describedby={describedBy}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Choose a rank…</option>
      {ranks.map((rank) => (
        <option key={rank.id} value={rank.id}>
          {rank.name}
        </option>
      ))}
    </Select>
  );
}
