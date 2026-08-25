/**
 * A social media destination. Every outbound "message us" link in the site
 * resolves through this table — no social URL is ever written into a component.
 */

/**
 * What the link is *for*, which is not the same question as which platform it
 * is on.
 *
 * `contact` is somewhere a conversation can start: Messenger, WhatsApp,
 * Telegram. These are the "Message us on …" buttons, and the first active one
 * carries every deal on the site.
 *
 * `follow` is somewhere the shop posts: TikTok, Instagram. Rendering those as
 * "Message us on TikTok" would send a buyer with a reference code into a feed,
 * which is a dead end — so they get an icon row instead, and never appear in
 * the contact buttons.
 */
export type SocialLinkKind = "contact" | "follow";

export type SocialLink = {
  id: string;
  platform: string;
  label: string;
  url: string;
  kind: SocialLinkKind;
  is_active: boolean;
  display_order: number;
};
