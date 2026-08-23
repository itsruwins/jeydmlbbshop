import { createClient } from "@/lib/supabase/server";
import type { AccountStats, AccountStatus } from "@/types/account";

/**
 * The five dashboard figures.
 *
 * Counted with `head: true` so Postgres returns the count and no rows — the
 * dashboard needs five numbers, not five copies of the table. Five small
 * counting queries in parallel beat one full table read.
 */
export async function getAccountStats(): Promise<AccountStats> {
  const supabase = await createClient();

  const base = () =>
    supabase.from("accounts").select("id", { count: "exact", head: true });

  const byStatus = (status: AccountStatus) => base().eq("status", status);

  const [total, available, reserved, sold, featured] = await Promise.all([
    base(),
    byStatus("available"),
    byStatus("reserved"),
    byStatus("sold"),
    base().eq("is_featured", true),
  ]);

  const firstError =
    total.error ??
    available.error ??
    reserved.error ??
    sold.error ??
    featured.error;

  if (firstError) {
    throw new Error(`Could not load dashboard figures: ${firstError.message}`);
  }

  return {
    total: total.count ?? 0,
    available: available.count ?? 0,
    reserved: reserved.count ?? 0,
    sold: sold.count ?? 0,
    featured: featured.count ?? 0,
  };
}
