import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

/**
 * The signed-in user and their profile, or null.
 *
 * Uses `getUser()`, which revalidates the token against Supabase. `getSession()`
 * only decodes the cookie, and a cookie is client-supplied — it must never be
 * what an authorisation decision rests on.
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  // Row Level Security restricts this to the caller's own row, so this cannot
  // be used to read anyone else's profile.
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    // Fall back to the auth record if the profile row has no email copy.
    email: data.email ?? user.email ?? null,
    role: data.role,
  };
}
