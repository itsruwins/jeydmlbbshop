import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

/** Shared shell so an input, a textarea and a select never drift apart. */
const control = (invalid?: boolean, extra?: string) =>
  cn(
    "w-full rounded-[var(--radius)] bg-surface text-ink",
    "border px-3 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
    invalid
      ? "border-[var(--danger-border)] hover:border-danger-ink"
      : "border-[var(--border-strong)] hover:border-ink-3",
    "disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-ink-3",
    "read-only:bg-surface-2",
    extra,
  );

export function Input({
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(control(invalid, "h-11"), className)}
      {...props}
    />
  );
}

export function Textarea({
  invalid,
  className,
  rows = 5,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(control(invalid, "py-2.5 resize-y leading-relaxed"), className)}
      {...props}
    />
  );
}
