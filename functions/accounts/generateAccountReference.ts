"use server";

import { createClient } from "@/lib/supabase/server";

const PREFIX = "J";

/**
 * Proposes the next unused reference, e.g. `J7`.
 *
 * The admin can overwrite it — this only removes the busywork of inventing a
 * code and the frustration of discovering a collision at save time.
 *
 * The number is derived from the highest existing `J#`, not from the row count,
 * so deleting a listing does not cause the next one to reuse its code.
 *
 * The codes are unpadded, so `J10` sorts before `J9` as text. The highest one
 * therefore has to be found by comparing numbers, which means reading every
 * `J*` reference rather than asking the database for the top row.
 *
 * This is a suggestion, not a reservation: two tabs open at once could be
 * offered the same number. The unique constraint on `account_reference` is what
 * actually prevents a duplicate, and `createAccount` turns that violation into
 * a readable field error.
 */
export async function generateAccountReference(): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("account_reference")
    .ilike("account_reference", `${PREFIX}%`);

  if (error) {
    // A failed suggestion must not block the form. The admin can type one.
    return `${PREFIX}1`;
  }

  const highest = (data ?? []).reduce((max, row) => {
    const digits = row.account_reference?.slice(PREFIX.length) ?? "";
    // `J12` counts, `JX` and `J12a` do not — anything the admin typed by hand
    // outside the series must not drag the next number along with it.
    if (!/^\d+$/.test(digits)) return max;
    const parsed = Number.parseInt(digits, 10);
    return parsed > max ? parsed : max;
  }, 0);

  return `${PREFIX}${highest + 1}`;
}
