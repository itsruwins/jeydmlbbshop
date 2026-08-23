"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/utils/errorMessage";

import { revalidateSocialSurfaces } from "./revalidateSocialSurfaces";

export type SetActiveResult = { ok: true } | { ok: false; message: string };

/**
 * Switches a destination on or off without deleting it.
 *
 * Useful for a platform you are stepping away from but may come back to — and
 * safer than deleting, since an inactive row keeps its label and order.
 */
export async function setSocialLinkActive(
  id: string,
  isActive: boolean,
): Promise<SetActiveResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("social_links")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      message: errorMessage(error, "Could not change the link."),
    };
  }

  revalidatePath("/admin/social-links");
  revalidateSocialSurfaces();

  return { ok: true };
}
