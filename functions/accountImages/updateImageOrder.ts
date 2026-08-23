"use client";

import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/utils/errorMessage";

export type UpdateOrderResult = { ok: true } | { ok: false; message: string };

/**
 * Writes a new gallery order.
 *
 * Takes the whole ordered list of ids and assigns 0..n-1, rather than trying to
 * express a move as a pair of swaps. Rewriting every position is idempotent —
 * running it twice gives the same result — where incremental swaps drift as
 * soon as one of them fails.
 *
 * `display_order` has no unique constraint on this table, so the updates can be
 * issued together without an intermediate collision.
 */
export async function updateImageOrder(
  orderedIds: string[],
): Promise<UpdateOrderResult> {
  const supabase = createClient();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("account_images").update({ display_order: index }).eq("id", id),
    ),
  );

  const failure = results.find((result) => result.error);

  if (failure?.error) {
    return {
      ok: false,
      message: errorMessage(failure.error, "Could not save the new image order."),
    };
  }

  return { ok: true };
}
