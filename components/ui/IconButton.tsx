"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type Tone = "default" | "danger" | "accent";

/**
 * A small square button whose only content is an icon.
 *
 * This exists because there were three of these — image reorder, image delete,
 * social link reorder, featured toggle — each reimplemented inline with
 * slightly different hover colours and none of them meeting the touch-target
 * minimum. One component means one set of states and one place to fix them.
 *
 * `label` is required rather than optional. An icon-only control with no
 * accessible name is invisible to a screen reader, and making the prop
 * optional is how that happens.
 *
 * `.hit-target` grows the tap area to 44px without changing the 32px the
 * button occupies on screen.
 */
const TONES: Record<Tone, string> = {
  default: "text-ink-3 hover:bg-surface-3 hover:text-ink",
  danger: "text-ink-3 hover:bg-danger-bg hover:text-danger-ink",
  accent: "text-accent hover:bg-accent-soft",
};

export function IconButton({
  label,
  onClick,
  disabled,
  tone = "default",
  pressed,
  title,
  className,
  children,
}: {
  /** Announced to assistive technology, and used as the tooltip by default. */
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: Tone;
  /** Set for a toggle, so its state is announced rather than only coloured. */
  pressed?: boolean;
  title?: string;
  className?: string;
  /** SVG path elements. The <svg> wrapper is supplied here. */
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      title={title ?? label}
      className={cn(
        "hit-target inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
        "transition-[color,background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        "motion-safe:active:scale-90",
        "disabled:pointer-events-none disabled:opacity-35",
        TONES[tone],
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <svg
        viewBox="0 0 16 16"
        className="size-4"
        fill={tone === "accent" && pressed ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}

/** Shared icon paths, so the same action never gets two different glyphs. */
export const ICONS = {
  chevronLeft: <path d="M9.5 3.5 5 8l4.5 4.5" />,
  chevronRight: <path d="M6.5 3.5 11 8l-4.5 4.5" />,
  chevronUp: <path d="M4 10l4-4 4 4" />,
  chevronDown: <path d="M4 6l4 4 4-4" />,
  trash: <path d="M3.5 4.5h9M6.5 4.5V3h3v1.5M5 4.5l.5 8h5l.5-8" />,
  star: (
    <path d="M8 1.9l1.85 3.75 4.15.6-3 2.93.71 4.12L8 11.35l-3.71 1.95.71-4.12-3-2.93 4.15-.6L8 1.9z" />
  ),
} as const;
