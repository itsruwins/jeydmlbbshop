"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLE } from "@/types/profile";

export type LoginResult = { error: string };

/**
 * Signs an administrator in.
 *
 * The order matters. Supabase Auth establishes *who* they are; the `profiles`
 * lookup establishes whether they may be here. A user who authenticates
 * successfully but is not an admin is signed straight back out, so no admin
 * session cookie is left behind for them to reuse.
 *
 * Failures return one message for both a wrong email and a wrong password.
 * Distinguishing them would let anyone with the login page enumerate which
 * addresses have accounts.
 *
 * Returns only on failure — success redirects, which throws.
 */
export async function loginAdmin(
  _previous: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "That email and password do not match an account." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    return {
      error: "Signed in, but your profile could not be read. Please try again.",
    };
  }

  if (profile?.role !== ADMIN_ROLE) {
    await supabase.auth.signOut();
    return {
      error: "This account does not have administrator access.",
    };
  }

  // Only follow an internal path. An open redirect here would let a crafted
  // login link bounce an admin to another site straight after signing in.
  const destination =
    next.startsWith("/admin") && !next.startsWith("//")
      ? next
      : "/admin/dashboard";

  redirect(destination);
}
