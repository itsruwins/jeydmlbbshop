/**
 * Application-level identity for an authenticated user.
 *
 * Being signed in confers nothing. `role === "admin"` is the only thing that
 * grants write access, and it is enforced in the database by
 * `public.is_admin()`, not merely in the UI.
 */
export type Profile = {
  id: string;
  email: string | null;
  role: string;
};

export const ADMIN_ROLE = "admin";

export function isAdminProfile(profile: Profile | null): boolean {
  return profile?.role === ADMIN_ROLE;
}
