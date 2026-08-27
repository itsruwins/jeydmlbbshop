"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/utils/errorMessage";
import {
  accountSchema,
  toFieldErrors,
  type AccountFieldErrors,
} from "@/schemas/accountSchema";

export type UpdateAccountResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: AccountFieldErrors };

/**
 * Saves edits to an existing listing.
 *
 * `account_reference` is deliberately stripped from the update. It is the
 * listing's public web address (/accounts/J7), so changing it would
 * break links already shared on social media. The form renders it read-only,
 * but a read-only input is a courtesy to the person, not a control — the
 * guarantee has to live here, where a hand-made request also hits it.
 *
 * `updated_at` is left alone — the database trigger owns it. Setting it from
 * the client would let a wrong clock rewrite history.
 */
export async function updateAccount(
  id: string,
  input: unknown,
): Promise<UpdateAccountResult> {
  const parsed = accountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();

  // Listed field by field rather than spread-minus-one, so what an edit is
  // allowed to touch is readable at a glance. account_reference is absent by
  // design — see above. `description` and `account_level` are absent because
  // the form no longer collects them, and omitting a column rather than
  // writing null means an edit cannot silently erase a value entered before
  // the field was removed.
  const { error } = await supabase
    .from("accounts")
    .update({
      price: parsed.data.price,
      rank_id: parsed.data.rank_id,
      collection_level_id: parsed.data.collection_level_id,
      server: parsed.data.server,
      hero_count: parsed.data.hero_count,
      skin_count: parsed.data.skin_count,
      status: parsed.data.status,
      // Only an available listing can be featured. Enforced here as well as in
      // updateAccountStatus, because the form can change the status too and the
      // rule must not depend on which route the change came through.
      is_featured:
        parsed.data.status === "available" ? parsed.data.is_featured : false,
      // Written as a pair, always. The schema has already emptied the array on
      // a listing that is not open for installment, so these two cannot reach
      // the database contradicting each other — which is what the CHECK
      // constraint on the table would otherwise reject as an opaque error.
      installment_available: parsed.data.installment_available,
      installment_percents: parsed.data.installment_percents,
    })
    .eq("id", id);

  if (error) {
    const message = errorMessage(error, "Could not save your changes.");

    if (error.code === "23505") {
      return {
        ok: false,
        message,
        fieldErrors: { account_reference: message },
      };
    }

    return { ok: false, message };
  }

  revalidatePath("/admin/accounts");
  revalidatePath(`/admin/accounts/${id}/edit`);
  revalidatePath("/admin/dashboard");
  // The buyer-facing pages are cached, so an admin change has to say so
  // explicitly or the catalogue and homepage would lag behind by up to the
  // revalidate window.
  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/accounts/[reference]", "page");

  return { ok: true };
}
