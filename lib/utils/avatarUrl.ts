/**
 * The letter shown when a vouch has no profile picture.
 *
 * Every entry currently has one, but this is called on data from a file that a
 * person edits, and a component that throws on an empty string would take the
 * whole storefront down over a blank field.
 */
export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
