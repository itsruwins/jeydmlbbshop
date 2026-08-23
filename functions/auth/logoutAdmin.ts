"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Ends the session and returns to the login page.
 *
 * Sign-out failures are swallowed deliberately: if the token is already
 * invalid, the person still wants to be logged out, and stranding them on the
 * dashboard with an error would be worse than the failure it reports.
 */
export async function logoutAdmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
