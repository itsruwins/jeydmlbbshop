"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/utils/errorMessage";
import {
  accountSchema,
  toFieldErrors,
  type AccountFieldErrors,
} from "@/schemas/accountSchema";

export type CreateAccountResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: AccountFieldErrors };

/**
 * Creates a listing and returns its id.
 *
 * The caller then navigates to the edit screen to add screenshots. Images
 * cannot be uploaded before this point: their Storage path is
 * `account-images/<account-id>/…`, and that id does not exist until the row
 * does. Creating the row first is what keeps the bucket free of orphaned
 * files from abandoned drafts.
 *
 * Authorisation is not checked here. Row Level Security rejects the insert if
 * the caller is not an admin, and doing it in the database means a missed UI
 * check cannot become a data breach.
 */
export async function createAccount(
  input: unknown,
): Promise<CreateAccountResult> {
  const parsed = accountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      ...parsed.data,
      // Same rule as on update: only an available listing can be featured.
      // New listings default to hidden, so this normally resolves to false.
      is_featured:
        parsed.data.status === "available" ? parsed.data.is_featured : false,
    })
    .select("id")
    .single();

  if (error || !data) {
    const message = errorMessage(error, "Could not create the listing.");

    // A duplicate reference is a field problem, not a page problem — show it
    // on the input the person can actually fix.
    if (error?.code === "23505") {
      return {
        ok: false,
        message,
        fieldErrors: { account_reference: message },
      };
    }

    return { ok: false, message };
  }

  revalidatePath("/admin/accounts");
  revalidatePath("/admin/dashboard");
  // The buyer-facing pages are cached, so an admin change has to say so
  // explicitly or the catalogue and homepage would lag behind by up to the
  // revalidate window.
  revalidatePath("/");
  revalidatePath("/accounts");

  return { ok: true, id: data.id };
}
