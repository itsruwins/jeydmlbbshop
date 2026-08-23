import { createClient } from "@/lib/supabase/server";
import type { SocialLink } from "@/types/socialLink";

/**
 * Every social link, including inactive ones, for the admin.
 *
 * Distinct from `getSocialLinks`, which reads anonymously and returns only the
 * active rows for public pages. Keeping them as two functions means a public
 * page cannot accidentally list a destination that was deliberately switched
 * off.
 */
export async function getAllSocialLinks(): Promise<SocialLink[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("social_links")
    .select("id, platform, label, url, is_active, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Could not load social links: ${error.message}`);
  }

  return (data ?? []) as SocialLink[];
}
