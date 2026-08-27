import { formatPrice } from "@/lib/utils/format";
import type { InstallmentPlan } from "@/lib/utils/installment";

/**
 * The other way to buy this account.
 *
 * ## Why it is a panel and not a line of text
 *
 * "Installment available" on its own raises the question it is meant to
 * answer — how much, and when? A buyer who has to open a chat to find out
 * whether they can afford the thing is a buyer deciding on incomplete
 * information, and the usual outcome of that is no message at all. Every
 * figure that matters is on the page before the conversation starts: what is
 * due now, what is left, for each option the shop will accept.
 *
 * ## Two numbers per row, not one
 *
 * The downpayment is the figure the offer turns on, so it takes the weight.
 * The balance sits under it in the quiet ramp because it is the part that is
 * *not* being asked for today — but leaving it out would mean stating a price
 * of ₱1,750 for a ₱3,500 account, which is the kind of half-truth a buyer
 * finds out about at handover. Both are shown, and they add back to exactly
 * the price on the tag (see `lib/utils/installment.ts` for why they always
 * do).
 *
 * ## Where it sits
 *
 * Directly above the contact card and below the status. The rail reads down as
 * one thought — this listing is available, here is how you can pay for it,
 * here is how to say so — and the panel is deliberately quieter than the card
 * beneath it: it is a fact about the offer, not the page's action.
 *
 * It is rendered only for a listing a buyer can actually take (see
 * `offersInstallment`), so a sold account does not advertise terms.
 */
export function InstallmentPanel({ plans }: { plans: InstallmentPlan[] }) {
  if (plans.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-accent-border bg-accent-soft p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-ink">Installment available</h2>
        <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-2">
          {plans.length === 1
            ? "Reserve this account with a downpayment and settle the balance on handover."
            : "Reserve this account with any of these downpayments and settle the balance on handover."}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {plans.map((plan) => (
          <li
            key={plan.percent}
            className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-surface px-3.5 py-2.5"
          >
            {/* The percentage is the name of the option — it is how the buyer
                will refer to it in the message — so it keeps its own plate
                rather than being folded into the sentence beside it. */}
            <span className="tabular rounded-[var(--radius-sm)] bg-accent-fill px-2 py-1 text-[length:var(--text-sm)] font-semibold leading-none text-on-accent-fill">
              {plan.percent}%
            </span>

            <span className="flex flex-col items-end gap-0.5">
              <span className="tabular text-[length:var(--text-md)] font-semibold leading-none text-ink">
                {formatPrice(plan.down)}
              </span>
              <span className="tabular text-[length:var(--text-xs)] leading-none text-ink-3">
                then {formatPrice(plan.balance)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-3">
        Message us below to arrange it — we will confirm the terms before
        anything is paid.
      </p>
    </section>
  );
}
