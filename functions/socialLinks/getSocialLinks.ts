import { cache } from "react";

import { createPublicClient } from "@/lib/supabase/public";
import { normaliseSocialLinks } from "@/lib/utils/socialLinks";
import type { SocialLink } from "@/types/socialLink";

/**
 * Active social destinations, in display order.
 *
 * Every outbound link resolves through here — both the "message us" buttons
 * and the follow icons. No social URL is written into a component, so changing
 * an account handle is a database edit rather than a code change.
 *
 * `cache` de-duplicates the call for one render pass. The header, the footer
 * and the page body each ask for these links independently — that is the right
 * shape for the components, and without this it would be three round trips for
 * one answer that cannot change between them.
 */
export const getSocialLinks = cache(async (): Promise<SocialLink[]> => {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("social_links")
    .select("id, platform, label, url, kind, is_active, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Could not load social links: ${error.message}`);
  }

  return normaliseSocialLinks(data);
});
