/**
 * ⚠️  PLACEHOLDER FEEDBACK — NOT REAL. REPLACE BEFORE LAUNCH.
 *
 * Every entry below is invented. They exist so the vouch section can be
 * designed and reviewed with realistic content in it, and for no other reason.
 *
 * Publishing invented buyer feedback on a shop whose entire proposition is
 * "you can trust us with money off-platform" is the exact thing that makes a
 * shop look like a scam when someone notices. It is also, in most markets,
 * illegal advertising. So:
 *
 *   • Before this page goes live, replace these with real feedback from the
 *     Facebook page — the buyer's words, their name as they wrote it, and the
 *     date of the actual post or message.
 *   • Ask each buyer before quoting them by name. `name` may be shortened
 *     ("Mark D.") if they prefer.
 *   • If there is no real feedback yet, empty this array. The section removes
 *     itself when it is empty, and a landing page with no vouch wall is far
 *     better than one with a fabricated one.
 *
 * A visible warning renders on this section in development so this cannot be
 * forgotten by accident. It does not render in production — the safeguard is
 * this file, not the banner.
 */
export type Vouch = {
  /** The buyer's name, exactly as they wrote it. */
  name: string;
  /** ISO date of the real post or message, for `<time datetime>`. */
  date: string;
  /** Their words. Not tidied up, not lengthened, not written for them. */
  quote: string;
  /** What they bought, when it is theirs to say. */
  bought?: string;
};

/** @see the file header — placeholder content, replace before launch. */
export const VOUCHES: Vouch[] = [
  {
    name: "Marvin R.",
    date: "2026-07-14",
    quote:
      "Legit. Sent the screenshots first, answered all my questions about the binding, then we did the handover on call. Smooth.",
    bought: "Mythic account",
  },
  {
    name: "Aira B.",
    date: "2026-06-29",
    quote:
      "Replied in like 10 minutes on a Sunday night. That alone made me trust it more than the other sellers I messaged.",
  },
  {
    name: "Kim P.",
    date: "2026-06-02",
    quote:
      "Everything in the listing matched what I got — skin count, collection level, even the server. No surprises after paying.",
    bought: "Collector account",
  },
  {
    name: "JM Santos",
    date: "2026-05-18",
    quote:
      "Was scared to buy an account online after getting scammed before. He let me check the profile screenshots as long as I wanted before I sent anything.",
  },
  {
    name: "Nico V.",
    date: "2026-04-27",
    quote: "Second account I bought here. Same process, same speed. Recommended.",
  },
  {
    name: "Denise L.",
    date: "2026-03-30",
    quote:
      "Fair price for the skins on it. Explained how the email change works step by step, did not rush me at all.",
    bought: "Mythical Glory account",
  },
];
