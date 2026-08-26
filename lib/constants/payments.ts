/**
 * How a buyer actually settles.
 *
 * Read the FAQ before changing anything here: "This site takes no payments and
 * holds no funds — it is a catalogue." That is still true. This list is not a
 * checkout and must never be written as one. It answers the question a buyer
 * asks in their head right before they open the chat — *can I even pay you the
 * way I pay for things?* — and answering it on the page saves a round trip.
 *
 * Which means the honest caption is "We accept", not "Pay with". Nothing on
 * this site takes money; Jade does, in the conversation that follows.
 *
 * Order is by how a buyer is likely to reach for them: the e-wallets and
 * digital banks first, the traditional banks next, PayPal last as the one
 * that is mostly there for buyers outside the country.
 *
 * Adding one means adding artwork too — see `PaymentGlyph.tsx` for where the
 * marks come from and what has to be true of a new one.
 */
export const PAYMENTS = [
  { id: "gcash", name: "GCash" },
  { id: "maya", name: "Maya" },
  { id: "maribank", name: "MariBank" },
  { id: "gotyme", name: "GoTyme Bank" },
  { id: "bpi", name: "BPI" },
  { id: "bdo", name: "BDO" },
  { id: "unionbank", name: "UnionBank" },
  { id: "paypal", name: "PayPal" },
] as const;

export type Payment = (typeof PAYMENTS)[number];
