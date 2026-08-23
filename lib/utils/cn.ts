/**
 * Joins class names, dropping falsy values.
 *
 * Deliberately not `clsx` + `tailwind-merge`: this project's components own
 * their own class strings and do not need conflict resolution, so a five-line
 * helper beats two dependencies.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
