"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/utils/errorMessage";
import { ACCOUNT_STATUSES, type AccountStatus } from "@/types/account";

export type UpdateStatusResult = { ok: true } | { ok: false; message: string };

/**
 * Changes just the status, from the accounts table.
 *
 * Separate from `updateAccount` because moving a listing to "sold" is the most
 * frequent thing that happens to it, and it should not require opening the
 * whole form and re-submitting every field.
 *
 * Selling or hiding a listing also clears its featured flag. Featuring is a
 * promise that something is worth the best space on the homepage, and that
 * stops being true the moment it is no longer for sale. Clearing the flag
 * rather than merely filtering it out at read time means the admin table tells
 * the truth too — a sold listing does not sit there still marked as featured,
 * waiting to reappear on the homepage if it is ever set back to available.
 */
export async function updateAccountStatus(
  id: string,
  status: AccountStatus,
): Promise<UpdateStatusResult> {
  if (!ACCOUNT_STATUSES.includes(status)) {
    return { ok: false, message: "That is not a valid status." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("accounts")
    .update(
      status === "available"
        ? { status }
        : { status, is_featured: false },
    )
    .eq("id", id);

  if (error) {
    return { ok: false, message: errorMessage(error, "Could not change the status.") };
  }

  revalidatePath("/admin/accounts");
  revalidatePath("/admin/dashboard");
  // The buyer-facing pages are cached, so an admin change has to say so
  // explicitly or the catalogue and homepage would lag behind by up to the
  // revalidate window.
  revalidatePath("/");
  revalidatePath("/accounts");

  return { ok: true };
}
