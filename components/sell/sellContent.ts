/**
 * The seller page's copy, separated from its markup.
 *
 * It lives here because it is the part most likely to change, and changing what
 * the page *says* should not mean editing how it is laid out. It is also the
 * part the shop owner should review most carefully — see the note below.
 *
 * IMPORTANT: this copy deliberately makes no commitments the owner has not
 * stated. There are no timeframes, no fees, no commission, no guarantees about
 * price or payment method, because inventing those would be putting words in
 * the owner's mouth on a page that sellers will treat as terms. Anywhere a real
 * policy belongs, the copy points the seller at a conversation instead.
 */

export const SELL_STEPS = [
  {
    title: "Send us the details",
    body: "Message us with your account's rank, collection level, skin count and server, along with the screenshots below. The more complete the first message, the faster we can answer.",
  },
  {
    title: "We review and value it",
    body: "We check what the account actually has against what accounts like it are selling for, then come back to you with a figure and the reasoning behind it.",
  },
  {
    title: "We agree the terms",
    body: "If the valuation works for you, we settle the details together — what is included, how the handover happens, and how you are paid.",
  },
  {
    title: "We list it",
    body: "Once everything is agreed, the account goes into the catalogue and we handle the buyer side from there.",
  },
] as const;

export const SELL_PREPARE = [
  {
    label: "Rank",
    detail: "Current rank, and your highest if it is different.",
  },
  {
    label: "Collection level",
    detail: "The exact tier, for example Mega Collector III.",
  },
  {
    label: "Skins",
    detail: "How many, and which rare ones — Legend, Collector, Epic or limited event skins.",
  },
  {
    label: "Heroes",
    detail: "How many you own.",
  },
  {
    label: "Account level",
    detail: "Shown on your profile.",
  },
  {
    label: "Server",
    detail: "The server the account plays on.",
  },
  {
    label: "Binding",
    detail: "Which accounts it is linked to, and whether it can be moved to a new one.",
  },
] as const;

export const SELL_SCREENSHOTS = [
  {
    title: "Profile",
    body: "Your profile page, showing account level, server and ID.",
  },
  {
    title: "Rank",
    body: "The rank screen for the current season.",
  },
  {
    title: "Collection",
    body: "The collection page showing your collector level.",
  },
  {
    title: "Skins",
    body: "Your skin list. Several shots are fine if one will not fit.",
  },
  {
    title: "Rare skins",
    body: "Close-ups of anything limited or hard to get. These do the most to raise the price.",
  },
] as const;

export const SELL_VALUE_FACTORS = [
  {
    title: "Rare and limited skins",
    body: "The single biggest factor. Collector, Legend and retired event skins are what buyers are usually looking for.",
  },
  {
    title: "Collection level",
    body: "A high collector tier is hard to fake and hard to rush, so it carries real weight.",
  },
  {
    title: "Rank",
    body: "Matters, but less than people expect — rank resets each season, and skins do not.",
  },
  {
    title: "Heroes owned",
    body: "A full or near-full roster widens who the account suits.",
  },
  {
    title: "Binding",
    body: "An account that can be moved cleanly to a new login is worth more, because the handover is safer for everyone.",
  },
] as const;
