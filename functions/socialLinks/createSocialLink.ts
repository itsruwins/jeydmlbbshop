"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/utils/errorMessage";
import {
  socialLinkSchema,
  toSocialFieldErrors,
  type SocialLinkFieldErrors,
} from "@/schemas/socialLinkSchema";

import { revalidateSocialSurfaces } from "./revalidateSocialSurfaces";

export type CreateSocialLinkResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: SocialLinkFieldErrors };

/**
 * Adds a social destination.
 *
 * New links go to the end of the order. The first active link becomes the
 * primary CTA button across the site, so appending — rather than prepending —
 * means adding a second platform never silently demotes the one already
 * carrying every conversation.
 */
export async function createSocialLink(
  input: unknown,
): Promise<CreateSocialLinkResult> {
  const parsed = socialLinkSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: toSocialFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();

  const { data: last, error: readError } = await supabase
    .from("social_links")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readError) {
    return {
      ok: false,
      message: errorMessage(readError, "Could not add the link."),
    };
  }

  const nextOrder = (last?.display_order ?? -1) + 1;

  const { error } = await supabase
    .from("social_links")
    .insert({ ...parsed.data, display_order: nextOrder });

  if (error) {
    return { ok: false, message: errorMessage(error, "Could not add the link.") };
  }

  revalidatePath("/admin/social-links");
  revalidateSocialSurfaces();

  return { ok: true };
}
