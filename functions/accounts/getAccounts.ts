import { createClient } from "@/lib/supabase/server";
import type { AccountStatus, AccountWithRelations } from "@/types/account";

import { ACCOUNT_WITH_RELATIONS_SELECT } from "./accountSelect";

export type AccountSort =
  | "newest"
  | "oldest"
  | "price_desc"
  | "price_asc"
  | "reference";

export type GetAccountsOptions = {
  /** Matches against reference and title. */
  search?: string;
  status?: AccountStatus | "all";
  featuredOnly?: boolean;
  sort?: AccountSort;
};

const ORDER: Record<AccountSort, { column: string; ascending: boolean }> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  price_desc: { column: "price", ascending: false },
  price_asc: { column: "price", ascending: true },
  reference: { column: "account_reference", ascending: true },
};

/**
 * Every listing the caller is allowed to see, with relations resolved.
 *
 * For an admin that includes hidden listings; for anyone else Row Level
 * Security filters them out before the rows leave the database. This function
 * does not add a status filter of its own for that purpose — doing so would
 * imply the visibility rule lives in application code, and it does not.
 */
export async function getAccounts(
  options: GetAccountsOptions = {},
): Promise<AccountWithRelations[]> {
  const { search, status = "all", featuredOnly = false, sort = "newest" } = options;

  const supabase = await createClient();

  let query = supabase.from("accounts").select(ACCOUNT_WITH_RELATIONS_SELECT);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (featuredOnly) {
    query = query.eq("is_featured", true);
  }

  const term = search?.trim();
  if (term) {
    // Commas and parentheses are the `or()` grammar's own separators, so a
    // search containing them would be parsed as extra conditions rather than
    // as text. Stripping them keeps a punctuation-heavy query from erroring.
    const safe = term.replace(/[,()]/g, " ").trim();
    if (safe) {
      query = query.or(
        `account_reference.ilike.%${safe}%,title.ilike.%${safe}%`,
      );
    }
  }

  const order = ORDER[sort] ?? ORDER.newest;
  query = query.order(order.column, { ascending: order.ascending });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Could not load accounts: ${error.message}`);
  }

  return (data ?? []) as unknown as AccountWithRelations[];
}
