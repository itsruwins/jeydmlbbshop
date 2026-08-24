/**
 * The theme preference, shared by the pre-paint script and the toggle.
 *
 * Three values, not two. A two-state switch can express "light" and "dark" but
 * has no way back to "follow my device" once it has been touched — the visitor
 * would have to clear site data to undo a tap. "system" is the way back.
 *
 * `Theme` is what the visitor chooses; `ResolvedTheme` is what the document
 * actually renders. They differ only for "system".
 */
export const THEME_STORAGE_KEY = "jeyd-theme";

export const THEMES = ["light", "dark", "system"] as const;

export type Theme = (typeof THEMES)[number];
export type ResolvedTheme = "light" | "dark";

export function isTheme(value: unknown): value is Theme {
  return (
    typeof value === "string" && (THEMES as readonly string[]).includes(value)
  );
}

/**
 * What "system" means right now.
 *
 * Queried as `prefers-color-scheme: light` rather than `: dark`, so a device
 * that expresses no preference at all resolves to dark — the same default a
 * first-time visitor gets, rather than a third behaviour.
 */
export function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/** Reads the stored preference. Absent, unreadable or unrecognised → dark. */
export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "dark";
  } catch {
    // Private modes can throw on access rather than returning null.
    return "dark";
  }
}

/** Applies a resolved theme to the document. */
export function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", resolved);
}
