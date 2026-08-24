/**
 * Facts about the shop that appear on the buyer-facing pages.
 *
 * They live here, in one place, for one reason: everything on this page is a
 * trust claim, and a trust claim that turns out to be false costs more than it
 * ever earned. When the numbers change, they change here — not in three
 * sections that then disagree with each other.
 *
 * Every value below was confirmed by the shop owner. Nothing is estimated,
 * rounded up, or inferred from the database.
 */
export const SHOP = {
  /** Legal-ish trading name. Used in the wordmark, footer and page titles. */
  name: "Jeyd MLBB Account Shop",

  /** Short form for tight spaces — the header wordmark on a phone. */
  shortName: "Jeyd",

  /**
   * Who the buyer is writing to. Used in the greeting of every pre-written
   * message: a name makes the first line read as a person being addressed
   * rather than a form being submitted, which is the whole difference between
   * this shop and a marketplace listing.
   */
  ownerName: "Jade",

  /**
   * Accounts sold to date. Deliberately written as a string with the `+`: it
   * is a floor, not a count, and rendering it as a number would invite someone
   * to increment it automatically from a table that does not hold that history.
   */
  accountsSold: "300+",

  /**
   * The reply-time promise. Stated because the owner will hold it on a bad day
   * too — a missed promise on a landing page costs more trust than it buys.
   */
  replyTime: "within the hour",

  /**
   * The Facebook post whose comments are the vouches.
   *
   * Linked from the vouch wall so a sceptical buyer can check the comments at
   * the source rather than taking the site's word for them. Worth knowing: the
   * post is on a personal profile, so anyone not logged into Facebook hits a
   * login wall rather than the comments.
   */
  vouchPostUrl: "https://www.facebook.com/share/p/1HAczZHcio/",
} as const;
