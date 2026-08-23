import { createPublicClient } from "@/lib/supabase/public";
import { PUBLIC_STATUSES, type AccountWithRelations } from "@/types/account";

import { ACCOUNT_WITH_RELATIONS_SELECT } from "./accountSelect";

/**
 * One public listing, looked up by the reference in its URL.
 *
 * The reference is the public identifier — `/accounts/J7` — because a
 * UUID is unreadable in a social post and unquotable by a buyer. It is
 * immutable once the listing is created, which is what makes it safe to put in
 * a link (see `updateAccount`).
 *
 * Returns null for both "no such listing" and "hidden from the public". Those
 * are the same answer on purpose: distinguishing them would confirm that a
 * draft exists.
 */
export async function getAccountByReference(
  reference: string,
): Promise<AccountWithRelations | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("accounts")
    .select(ACCOUNT_WITH_RELATIONS_SELECT)
    // Case-insensitive so a link typed as `j7` still resolves.
    .ilike("account_reference", reference)
    // Second layer behind RLS: a hidden draft must 404, not render, even if a
    // policy is loosened by mistake.
    .in("status", PUBLIC_STATUSES)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load the listing: ${error.message}`);
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
