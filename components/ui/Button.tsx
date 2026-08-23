"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Swaps the label for a spinner and blocks further presses. */
  loading?: boolean;
  /** Shown while loading, so the button says what is happening. */
  loadingLabel?: string;
  icon?: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover border border-transparent",
  secondary:
    "bg-surface text-ink border border-[var(--border-strong)] hover:bg-surface-3",
  ghost:
    "bg-transparent text-ink-2 border border-transparent hover:bg-surface-3 hover:text-ink",
  danger:
    "bg-danger text-on-danger hover:bg-danger-hover border border-transparent",
};

const SIZES: Record<Size, string> = {
  // 40px min height on touch targets, 32px only for dense toolbar buttons.
  // 32px reads correctly in a dense admin table, but a thumb needs 44. The
  // hit-target utility grows the tap area without changing the size.
  sm: "hit-target h-8 px-2.5 text-[length:var(--text-sm)] gap-1.5",
  md: "h-11 px-4 text-[length:var(--text-base)] gap-2",
};

/**
 * The one button in the app. Every screen uses it, so a Save button cannot
 * look different in two places.
 *
 * Press feedback fires on pointer-down via `:active`, not on click — waiting
 * for release reads as lag.
 */
export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  loadingLabel,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius)] font-medium whitespace-nowrap",
        "transition-[background-color,border-color,color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        "motion-safe:active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingLabel ?? children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
