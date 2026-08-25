import type { SocialLink, SocialLinkKind } from "@/types/socialLink";

/**
 * Splitting the one table into the two things it feeds.
 *
 * `kind` decides which surface a link lands on, and it is the only thing
 * standing between a buyer holding a reference code and a TikTok feed. So the
 * check lives here rather than being written inline at each of the five call
 * sites, where the fifth one eventually gets it backwards.
 */

/** Anything that is not explicitly a feed is somewhere we can be reached. */
function kindOf(value: unknown): SocialLinkKind {
  return value === "follow" ? "follow" : "contact";
}

/**
 * Rows as the database returned them, with `kind` forced into the vocabulary.
 *
 * A row written before the column existed, or one carrying a value nothing
 * recognises, comes back as `contact` — the behaviour every row already had.
 * Failing that way round matters: an unreadable value should cost a follow
 * icon, never the button someone uses to reach the shop.
 */
export function normaliseSocialLinks(rows: unknown): SocialLink[] {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => {
    const link = row as SocialLink;
    return { ...link, kind: kindOf(link.kind) };
  });
}

/** Somewhere a conversation can start. These are the "Message us on …" buttons. */
export function contactLinks(links: SocialLink[]): SocialLink[] {
  return links.filter((link) => link.kind === "contact");
}

/** Somewhere the shop posts. These are the follow icons. */
export function followLinks(links: SocialLink[]): SocialLink[] {
  return links.filter((link) => link.kind === "follow");
}
