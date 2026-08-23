import { createClient } from "@/lib/supabase/server";
import type { AccountWithRelations } from "@/types/account";

import { ACCOUNT_WITH_RELATIONS_SELECT } from "./accountSelect";

/**
 * One listing with its relations, or null if it does not exist or the caller
 * may not see it. Those two cases are deliberately indistinguishable — telling
 * an unauthorised caller that a row exists is itself a disclosure.
 *
 * Images come back in gallery order.
 */
export async function getAccountById(
  id: string,
): Promise<AccountWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("accounts")
    .select(ACCOUNT_WITH_RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load the account: ${error.message}`);
  }

  if (!data) return null;

  const account = data as unknown as AccountWithRelations;

  return {
    ...account,
    images: [...(account.images ?? [])].sort(
      (a, b) => a.display_order - b.display_order,
    ),
  };
}
