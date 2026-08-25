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

export type UpdateSocialLinkResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: SocialLinkFieldErrors };

/** Saves edits to one social destination. */
export async function updateSocialLink(
  id: string,
  input: unknown,
): Promise<UpdateSocialLinkResult> {
  const parsed = socialLinkSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: toSocialFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("social_links")
    .update({
      platform: parsed.data.platform,
      label: parsed.data.label,
      url: parsed.data.url,
      kind: parsed.data.kind,
      is_active: parsed.data.is_active,
    })
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      message: errorMessage(error, "Could not save the link."),
    };
  }

  revalidatePath("/admin/social-links");
  revalidateSocialSurfaces();

  return { ok: true };
}
