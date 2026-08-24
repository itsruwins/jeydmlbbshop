import { SHOP } from "@/lib/constants/shop";
import { formatPrice } from "@/lib/utils/format";
import type { AccountStatus } from "@/types/account";

/**
 * Every message the site hands a buyer or seller to send us.
 *
 * They live together because they are one voice, and because the alternative —
 * a string typed inline at each call site — is how the buyer CTA ends up
 * greeting people differently from the seller CTA for no reason.
 *
 * All of them open by name. The shop is one person, and a message that starts
 * "Hi Jade" reads as someone being written to rather than a form being filed.
 *
 * None of them carry a link. The account reference is what identifies a
 * listing, and it is short enough to read at a glance in a chat; a URL only
 * makes the message longer and more likely to be trimmed or reworded before it
 * is sent.
 */

/** Someone who arrived on the homepage and has a general question. */
export const GENERAL_MESSAGE = `Hi ${SHOP.ownerName}! I saw your shop and I have a question.`;

/** Someone who wants to sell us an account. */
export const SELL_MESSAGE = `Hi ${SHOP.ownerName}! I'd like to sell my MLBB account.`;

/**
 * A buyer asking about one listing.
 *
 * The price is included so the message records what they were looking at. If a
 * listing is repriced between the buyer opening it and us reading the message,
 * that discrepancy is worth seeing rather than discovering halfway through the
 * conversation.
 *
 * A listing that is already sold or reserved gets a different opening. Someone
 * asking about an account they cannot buy is a buyer with proven taste, and
 * "do you have anything similar" is a better outcome than a dead end.
 */
export function listingMessage({
  reference,
  price,
  status,
}: {
  reference: string;
  price: number | null;
  status: AccountStatus;
}): string {
  if (status !== "available") {
    return `Hi ${SHOP.ownerName}! I saw account ${reference} is ${status}. Do you have anything similar?`;
  }

  const priced = price === null ? "" : ` (${formatPrice(price)})`;
  return `Hi ${SHOP.ownerName}! I'm interested in account ${reference}${priced}.`;
}
