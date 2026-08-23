import { createPublicClient } from "@/lib/supabase/public";
import type { AccountWithRelations } from "@/types/account";

import { ACCOUNT_WITH_RELATIONS_SELECT } from "./accountSelect";

/**
 * Featured listings for the homepage.
 *
 * Restricted to `available` on purpose. Featuring is an editorial choice, but
 * showcasing something a visitor cannot buy wastes the most valuable space on
 * the site — so a listing that sells drops out of the homepage on its own,
 * without anyone having to remember to un-feature it.
 */
export async function getFeaturedAccounts(
  limit = 6,
): Promise<AccountWithRelations[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("accounts")
    .select(ACCOUNT_WITH_RELATIONS_SELECT)
    .eq("is_featured", true)
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Could not load featured listings: ${error.message}`);
  }

  return (data ?? []) as unknown as AccountWithRelations[];
}
