/**
 * Buyer feedback, transcribed from the comments on the shop's Facebook post.
 *
 * ## These are real. Do not add anything that is not.
 *
 * Every entry below was copied from a screenshot of the actual comment, kept in
 * `Vouches/` outside this repository. The names are the commenters' own
 * Facebook display names, used with their permission. The words are exactly as
 * they were written — the shouting, the Taglish, the emoji and the spelling are
 * all theirs, and tidying them is what would make them stop reading as real.
 *
 * Inventing an entry here, or embellishing one, would do more damage than
 * having no feedback at all: this shop's entire proposition is that money moves
 * off-platform on the strength of what the site shows.
 *
 * ## Why a file and not a table
 *
 * There is no automated way in. Facebook's Graph API exposes comments only for
 * Pages you administer through a reviewed app; this shop runs on a personal
 * profile, which has none, and every logged-out request for the post — browser,
 * `curl`, mbasic — returns a login wall. So each of these is transcribed by
 * hand anyway, and a database bought nothing that a reviewed, version-tracked
 * file does not.
 *
 * ## Adding one
 *
 * 1. Screenshot the comment and the person's profile picture.
 * 2. Crop the picture square and drop it in `public/vouches/` as `<n>.jpg`.
 * 3. Add an entry below. `posted` is the relative time Facebook showed at the
 *    moment of the screenshot — see the note on that field.
 */
export type Vouch = {
  /** Stable key. Matches the source screenshot in `Vouches/`. */
  id: string;
  /** Their Facebook display name, exactly as it appears on the comment. */
  name: string;
  /** Their words, unedited. */
  quote: string;
  /**
   * The relative age Facebook displayed when the screenshot was taken — "6d",
   * "12w". Frozen at that moment and deliberately so: the alternative was
   * converting it to a date, which would state a precision the source does not
   * have. It does mean a comment labelled "6d" stays labelled "6d" forever, so
   * these are worth re-checking if the wall is ever rebuilt.
   */
  posted: string;
  /** File in `public/vouches/`. */
  avatar: string;
};

/**
 * Order matters: this is the order they appear on the wall.
 *
 * The three the homepage hero uses are chosen in `app/(public)/page.tsx` by id,
 * not by position, so reordering this list cannot silently change the hero.
 */
export const VOUCHES: Vouch[] = [
  {
    id: "1",
    name: "Dutch Diamond",
    quote: "SUPER LEGIT! THANK U SO MUCH JADE❤️ 'til our next transact.",
    posted: "6d",
    avatar: "/vouches/1.jpg",
  },
  {
    id: "2",
    name: "June Rey R. Magno",
    quote:
      "Solid legit to, babalik ako after 5 days para sa clean na clean Mr. Clean ahhahahaha",
    posted: "5d",
    avatar: "/vouches/2.jpg",
  },
  {
    id: "3",
    name: "Bermon Sanreb",
    quote:
      "Thank you  NICE DEAL 👌 highly recommended to all who wanted to buy a ML account kindly pm this person.",
    posted: "12w",
    avatar: "/vouches/3.jpg",
  },
  {
    id: "4",
    name: "Angelina Gabriela",
    quote: "Fast transact, will prolly buy again! 🤝",
    posted: "12w",
    avatar: "/vouches/4.jpg",
  },
  {
    // The original tags Jade's profile mid-sentence. The tag is dropped and the
    // words around it kept: a mention is a link, not something they said, and
    // rendering it inline read as the name written twice.
    id: "5",
    name: "Julius Tuvera",
    quote:
      "Hello guys super satisfied with kuya jade SUPER LEGIT AT MABILIS.. SALAMAT PO NG MARAMI KUYA JADE ❤️❤️❤️",
    posted: "12w",
    avatar: "/vouches/5.jpg",
  },
  {
    id: "6",
    name: "RA LD",
    quote:
      "guys legit to promise wag na kayung mag dalawang isip bumili kung kaya niyo guys",
    posted: "20w",
    avatar: "/vouches/6.jpg",
  },
  {
    id: "7",
    name: "Matthew Vizcarra",
    quote:
      "Up Legit to guys solid 🔥🔥 Dito ulit ako bibili 💯% guys solid sobrang bilis kausap at sobrang bait ni bossing 👌👌👌 sulit pera niyo dito guys",
    posted: "20w",
    avatar: "/vouches/7.jpg",
  },
  {
    id: "8",
    name: "Iyan Jeff Macrohon Ortiz",
    quote: "Clean transaction. Will recommend.",
    posted: "20w",
    avatar: "/vouches/8.jpg",
  },
];

/**
 * The three that stand in the hero, named by id.
 *
 * Chosen for what they answer rather than for how warm they are:
 *   1 — a repeat customer, in as many words
 *   3 — recommends the shop to strangers, and does it in English
 *   6 — "wag na kayung mag dalawang isip": speaks to the hesitation itself
 */
export const HERO_VOUCH_IDS = ["1", "3", "6"] as const;
