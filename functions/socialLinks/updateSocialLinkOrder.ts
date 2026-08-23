"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/utils/errorMessage";

import { revalidateSocialSurfaces } from "./revalidateSocialSurfaces";

export type UpdateOrderResult = { ok: true } | { ok: false; message: string };

/**
 * Writes a new order for the social links.
 *
 * Order is not cosmetic here: the first *active* link becomes the primary CTA
 * button on every listing and on the seller page, and the rest sit beside it.
 * Reordering is how you choose which platform carries the conversation.
 *
 * Takes the whole ordered list and assigns 0..n-1 rather than expressing a move
 * as a pair of swaps — rewriting every position is idempotent, where
 * incremental swaps drift as soon as one fails.
 */
export async function updateSocialLinkOrder(
  orderedIds: string[],
): Promise<UpdateOrderResult> {
  const supabase = await createClient();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("social_links").update({ display_order: index }).eq("id", id),
    ),
  );

  const failure = results.find((result) => result.error);

  if (failure?.error) {
    return {
      ok: false,
      message: errorMessage(failure.error, "Could not save the new order."),
    };
  }

  revalidatePath("/admin/social-links");
  revalidateSocialSurfaces();

  return { ok: true };
}
