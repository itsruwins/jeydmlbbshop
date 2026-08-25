import { SHOP } from "@/lib/constants/shop";

/**
 * The questions a buyer actually has before they send money to a stranger.
 *
 * ⚠️  Every answer below states how this shop operates. Read them and correct
 * anything that is not exactly right — an answer here is a promise, and a
 * promise the shop cannot keep is worse than no FAQ at all.
 *
 * They were written from what the site already claims elsewhere: full
 * screenshot sets on every listing, replies within the hour, the handover done
 * personally, and no payments taken on the site. Nothing here invents a
 * guarantee, a refund policy or a recovery process, because those are decisions
 * for the shop owner rather than facts I can state on their behalf.
 *
 * None of the competitors answer these well — PlayerAuctions and G2G bury them
 * in a help centre — so the page answers them where the hesitation happens.
 */
export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
  {
    question: "How do I know the account is real?",
    answer:
      "Every listing carries its full screenshot set — profile, rank, collection, skins — taken from the account itself, not from a promotional image. Open a listing and look for as long as you like before you say anything to us. If you want a specific screen you cannot see there, ask and we will send it.",
  },
  {
    question: "How does the handover actually work?",
    answer:
      "We agree the details with you first, then go through it together: you watch the email and binding change happen rather than being told it has been done. We stay with it until the account is in your hands and you have signed in yourself.",
  },
  {
    question: "Do I pay through this website?",
    answer:
      "No. This site takes no payments and holds no funds — it is a catalogue. Everything is arranged directly with us in chat, which is also why the reference code matters: it is how we know exactly which account you mean.",
  },
  {
    question: "How quickly will you reply?",
    answer: `${SHOP.replyTime.charAt(0).toUpperCase()}${SHOP.replyTime.slice(1)}, including evenings and weekends. If we are mid-handover with someone else it may be closer to the hour than to ten minutes, but you will not be left waiting a day.`,
  },
  {
    question: "Can I ask questions before buying anything?",
    answer:
      "Yes, and most people do. Nothing is reserved by asking and there is no pressure to decide — the account is not going anywhere while you think about it. Message us with the reference and ask whatever you need.",
  },
  {
    question: "What if I want something you do not have listed?",
    answer:
      "Tell us what you are after — rank, skins, budget — and we will let you know when something matching comes in. Stock moves regularly and not everything reaches the site before it sells.",
  },
];
