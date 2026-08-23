import { redirect } from "next/navigation";

import { isAdminProfile, type Profile } from "@/types/profile";

import { getCurrentUser } from "./getCurrentUser";

/**
 * The authorisation gate for the admin section.
 *
 * Middleware already established that *someone* is signed in. This decides
 * whether that someone may be here, and it runs on the server, so a non-admin
 * never receives the dashboard markup — not merely a hidden version of it.
 *
 * This is defence in depth, not the defence itself. Row Level Security and
 * `public.is_admin()` are what actually stop a non-admin writing to the
 * database; a bypassed UI check would still hit a closed door.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentUser();

  // Both redirects carry a reason, and that is load-bearing rather than
  // cosmetic. The proxy sends a signed-in visitor from the login page to the
  // dashboard; this layout sends an unauthorised one back. Without the `error`
  // parameter to tell the proxy to stand down, those two rules would bounce a
  // signed-in non-admin between each other indefinitely.
  if (!profile) {
    // Authenticated, but no readable profile row — so there is no role to
    // check and no access to grant.
    redirect("/admin/login?error=no-profile");
  }

  if (!isAdminProfile(profile)) {
    redirect("/admin/login?error=not-admin");
  }

  return profile;
}
