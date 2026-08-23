/**
 * A social media destination. Every outbound "message us" link in the site
 * resolves through this table — no social URL is ever written into a component.
 *
 * Consumed from Phase 7 onward.
 */
export type SocialLink = {
  id: string;
  platform: string;
  label: string;
  url: string;
  is_active: boolean;
  display_order: number;
};
