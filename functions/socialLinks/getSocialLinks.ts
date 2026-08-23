import { createPublicClient } from "@/lib/supabase/public";
import type { SocialLink } from "@/types/socialLink";

/**
 * Active social destinations, in display order.
 *
 * Every outbound "message us" link resolves through here. No social URL is
 * written into a component, so changing an account handle is a database edit
 * rather than a code change.
 *
 * Consumed from Phase 7. Defined now so nothing is tempted to hardcode a URL
 * in the meantime.
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("social_links")
    .select("id, platform, label, url, is_active, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Could not load social links: ${error.message}`);
  }

  return (data ?? []) as SocialLink[];
}
