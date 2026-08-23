import Link from "next/link";

import type { AccountStats } from "@/types/account";

/**
 * The five dashboard figures.
 *
 * A single divided row, not five cards. Cards would imply these are five
 * independent objects; they are five views of one number, and dividers say that
 * better than a border around each.
 *
 * Every cell carries a top and left border and is pulled back a pixel, so the
 * outermost edges tuck under the container's own border and only the interior
 * lines remain visible. That is one rule for all five cells: no per-index
 * "which edge is this?" logic, and it re-flows correctly at 2, 3 and 5 columns.
 *
 * The obvious alternative — a 1px grid gap over a coloured backing — breaks
 * here. Five cells in two or three columns leave an empty cell in the last
 * row, and the backing colour shows through it as a grey block.
 *
 * Every figure links into the filtered list, which is what stops this being
 * decoration — the number says something is there, and the same element takes
 * you to it.
 */
const FIGURES = [
  { key: "total", label: "Total", href: "/admin/accounts" },
  { key: "available", label: "Available", href: "/admin/accounts?status=available" },
  { key: "reserved", label: "Reserved", href: "/admin/accounts?status=reserved" },
  { key: "sold", label: "Sold", href: "/admin/accounts?status=sold" },
  { key: "featured", label: "Featured", href: "/admin/accounts?featured=1" },
] as const satisfies ReadonlyArray<{
  key: keyof AccountStats;
  label: string;
  href: string;
}>;

export function StatRow({ stats }: { stats: AccountStats }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface sm:grid-cols-3 lg:grid-cols-5">
      {FIGURES.map((figure) => (
        <Link
          key={figure.key}
          href={figure.href}
          className="-ml-px -mt-px flex flex-col gap-1 border-l border-t border-[var(--border)] bg-surface px-4 py-4 transition-colors duration-[var(--dur-fast)] hover:bg-surface-3"
        >
          <span className="text-[length:var(--text-sm)] tracking-[0.005em] text-ink-3">
            {figure.label}
          </span>
          <span className="tabular text-[length:var(--text-2xl)] font-semibold leading-none tracking-[-0.015em] text-ink">
            {stats[figure.key]}
          </span>
        </Link>
      ))}
    </div>
  );
}
