/**
 * Navigation is named for what it contains, not for a vague umbrella.
 * "Overview" and "Accounts" are predictable; "Home" and "Manage" are not.
 */
export const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/social-links", label: "Social links" },
] as const;

/** Marks a nav item current, including on its child routes. */
export function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
