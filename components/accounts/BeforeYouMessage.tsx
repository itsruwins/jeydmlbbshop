import { SHOP } from "@/lib/constants/shop";

/**
 * The two things a buyer wants to know in the second before they hit send.
 *
 * ## Why it is on the listing at all
 *
 * Both facts are already on the site — the FAQ says them, and the landing page
 * builds a whole inverted band around "nothing is paid until step three". None
 * of that is on screen at the moment it matters. A buyer who has read the
 * specs, read the pre-written message and put the cursor over the button is
 * asking two questions the listing page had no answer for: *am I about to be
 * charged by this website*, and *if I send this, will anyone actually reply?*
 *
 * Neither is a sales line. The first is the shop's most important disclaimer —
 * this is a catalogue, not a checkout — and stating it beside the button is
 * the difference between a buyer trusting the flow and a buyer closing the tab
 * looking for the payment form. The second is a promise the owner holds on a
 * bad day too, which is why it is quoted from `SHOP` rather than written here.
 *
 * ## Why it is quiet
 *
 * Sunk onto `--surface-2` with a small muted heading, where the contact card
 * above it is `--surface` with a semibold one. The rail has exactly one action
 * and this is not it: this is the footnote that lets the action be taken. Give
 * it the card's weight and the column reads as two offers instead of one offer
 * and its terms.
 *
 * ## Why the listing page and not the layout
 *
 * It is only drawn on a listing with no installment panel — see the note in
 * the account page. The installment panel closes with the same promise
 * attached to the actual figures ("we will confirm the terms before anything
 * is paid"), and said twice in one column both copies get weaker.
 */
export function BeforeYouMessage() {
  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface-2 p-4 sm:p-5">
      <h2 className="text-[length:var(--text-sm)] font-medium tracking-[0.005em] text-ink-3">
        Before you message
      </h2>

      <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-2">
        This site takes no payments and holds no funds — it is a catalogue.
        Everything is arranged directly with us in chat.
      </p>

      {/* The hairline is doing the work a second heading would otherwise do:
          the line above is about money, this one is about time, and they are
          two answers rather than one paragraph. */}
      <p className="flex items-start gap-2 border-t border-[var(--border)] pt-3 text-[length:var(--text-sm)] leading-relaxed text-ink-2">
        <ClockIcon />
        <span>
          Replies {SHOP.replyTime}, including evenings and weekends.
        </span>
      </p>
    </section>
  );
}

/**
 * Drawn here at the site's stroke weight rather than pulled from a set, for
 * the same reason as `specIcons` — a mark drawn for 24px reads heavy and
 * slightly foreign beside 13px text. Decorative: the sentence carries it.
 */
function ClockIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 size-[15px] shrink-0 text-ink-3"
    >
      <circle cx="10" cy="10" r="7.2" />
      <path d="M10 5.8V10l2.8 1.7" />
    </svg>
  );
}
