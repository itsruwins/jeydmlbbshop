"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  readStoredTheme,
  resolveSystemTheme,
  type Theme,
} from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Light",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  },
  {
    value: "system",
    label: "System",
    icon: (
      <>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
  },
];

/**
 * The theme control: Light · Dark · System.
 *
 * Rendered as a radio group rather than three buttons, because the three
 * options are one mutually exclusive setting — that is what lets a screen
 * reader announce "Dark, 2 of 3" instead of three unrelated toggles.
 *
 * The initial state is "dark" on both server and client so the markup matches
 * during hydration; the stored preference is read in an effect and corrects it
 * immediately after. The *painted* colours are never wrong in the meantime —
 * `ThemeScript` has already set the attribute before first paint. Only the
 * highlighted segment can be briefly behind, and only in the frame before
 * hydration.
 *
 * While the preference is "system", a listener keeps the document in step with
 * the device, so a phone crossing into night mode changes the page without a
 * reload. The listener is removed as soon as the visitor picks a fixed theme —
 * otherwise their explicit choice would be overwritten the next time the
 * device changed its mind.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  useEffect(() => {
    if (theme !== "system") return;

    const query = window.matchMedia("(prefers-color-scheme: light)");
    const sync = () => applyTheme(resolveSystemTheme());

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [theme]);

  const choose = (next: Theme) => {
    setTheme(next);
    applyTheme(next === "system" ? resolveSystemTheme() : next);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable. The theme still applies for this visit;
      // it simply will not be remembered, which is better than failing.
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-[var(--border)] bg-surface-2 p-0.5",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const selected = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            // Only the selected option stays in the tab order; arrow keys are
            // the expected way to move within a radio group.
            tabIndex={selected ? 0 : -1}
            onClick={() => choose(option.value)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowRight" && event.key !== "ArrowLeft")
                return;
              event.preventDefault();
              const index = OPTIONS.findIndex((o) => o.value === theme);
              const next =
                OPTIONS[
                  (index +
                    (event.key === "ArrowRight" ? 1 : -1) +
                    OPTIONS.length) %
                    OPTIONS.length
                ];
              choose(next.value);
            }}
            className={cn(
              "hit-target grid size-7 place-items-center rounded-full",
              "transition-[background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
              selected
                ? "bg-surface text-ink shadow-[var(--shadow-sm)]"
                : "text-ink-3 hover:text-ink",
            )}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-[15px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {option.icon}
            </svg>
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
