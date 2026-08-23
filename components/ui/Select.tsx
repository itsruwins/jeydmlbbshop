import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A native `<select>`, deliberately.
 *
 * The collection level list is 45 entries long and the rank list is 7. A
 * custom listbox would have to re-implement type-ahead, mobile wheel pickers
 * and keyboard semantics that the platform already gets right. Reinventing a
 * standard control for flavour is a product-register ban.
 */
export function Select({
  invalid,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full appearance-none rounded-[var(--radius)] bg-surface text-ink",
          "border pl-3 pr-9 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
          invalid
            ? "border-[var(--danger-border)] hover:border-danger-ink"
            : "border-[var(--border-strong)] hover:border-ink-3",
          "disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-ink-3",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
      >
        <path
          d="M4 6.5 8 10.5 12 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
