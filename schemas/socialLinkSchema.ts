import { z } from "zod";

import type { SocialLinkKind } from "@/types/socialLink";

/**
 * Validation for a social destination.
 *
 * `label` is required, and that is the point of this schema existing. The
 * label is the text on the CTA button and in the footer; a row saved without
 * one produced a button reading "Message us on " and an invisible footer link.
 * The database allows a blank string, so the guarantee has to be here.
 */

export const SOCIAL_PLATFORMS = [
  "Facebook",
  "Messenger",
  "Instagram",
  "WhatsApp",
  "Telegram",
  "Viber",
  "Discord",
  "TikTok",
  "X",
  "Other",
] as const;

export const SOCIAL_LINK_KINDS = [
  "contact",
  "follow",
] as const satisfies readonly SocialLinkKind[];

/**
 * Platforms that are a feed rather than an inbox, so the form can preselect
 * "follow" when one is chosen. A suggestion only — a shop that genuinely takes
 * orders through Instagram DMs changes it back, and nothing here overrides it.
 */
const FEED_PLATFORMS = new Set<string>(["Instagram", "TikTok", "X"]);

export function suggestedKind(platform: string): SocialLinkKind {
  return FEED_PLATFORMS.has(platform.trim()) ? "follow" : "contact";
}

export const socialLinkSchema = z.object({
  platform: z
    .string()
    .trim()
    .min(1, "Choose a platform.")
    .max(40, "Platform must be 40 characters or fewer."),

  label: z
    .string()
    .trim()
    .min(1, "Add a label — it is the name buyers see on the link.")
    .max(40, "Label must be 40 characters or fewer."),

  /**
   * Contact links become "Message us on …" buttons; follow links become the
   * icon row. Defaulted rather than required so a row written before this
   * field existed still parses, and defaults to the behaviour it already had.
   */
  kind: z.enum(SOCIAL_LINK_KINDS).default("contact"),

  url: z
    .string()
    .trim()
    .min(1, "Add the link.")
    .max(500, "That link is too long.")
    .refine(
      (value) => {
        try {
          const parsed = new URL(value);
          // Only web links. A `javascript:` or `data:` URL here would run in
          // the visitor's browser from a button the site presents as trusted.
          return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
          return false;
        }
      },
      { message: "Enter a full link, starting with https://" },
    ),

  is_active: z.boolean().default(true),
});

export type SocialLinkFormInput = z.input<typeof socialLinkSchema>;
export type SocialLinkFormValues = z.output<typeof socialLinkSchema>;

export type SocialLinkFieldErrors = Partial<
  Record<keyof SocialLinkFormValues, string>
>;

export function toSocialFieldErrors(error: z.ZodError): SocialLinkFieldErrors {
  const result: SocialLinkFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) {
      result[key as keyof SocialLinkFormValues] = issue.message;
    }
  }
  return result;
}
