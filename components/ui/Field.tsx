import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type FieldProps = {
  id: string;
  label: string;
  /** Static guidance, shown before anything goes wrong. */
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Label, control, hint and error as one unit.
 *
 * The error replaces the hint rather than stacking below it — two lines of
 * small text under a control is noise, and the hint is no longer the thing the
 * person needs to read. `aria-describedby` is wired by the caller using the
 * ids this emits.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-[length:var(--text-sm)] font-medium text-ink-2 tracking-[0.005em]"
      >
        {label}
        {required && (
          <span className="text-danger-ink ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[length:var(--text-sm)] text-danger-ink"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[length:var(--text-sm)] text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The id a control should point `aria-describedby` at.
 *
 * Mirrors the render logic above: the error replaces the hint, so the control
 * points at whichever one is actually on screen. `hasHint` is a boolean rather
 * than the hint text, because the caller has already passed that text to
 * `<Field>` and repeating it here would be two places to keep in step.
 */
export function describedBy(
  id: string,
  { error, hasHint }: { error?: string; hasHint?: boolean },
): string | undefined {
  if (error) return `${id}-error`;
  if (hasHint) return `${id}-hint`;
  return undefined;
}
