import type { Metadata } from "next";

import { SellCTA } from "@/components/sell/SellCTA";
import {
  SELL_PREPARE,
  SELL_SCREENSHOTS,
  SELL_STEPS,
  SELL_VALUE_FACTORS,
} from "@/components/sell/sellContent";

/**
 * Cached and regenerated at most every five minutes. The page is static copy
 * plus the social links, so the only thing that can go stale is a contact
 * destination — but a stale contact link is exactly the kind of staleness worth
 * avoiding, so the window is kept short.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sell your account",
  description:
    "How to sell your Mobile Legends account with us: what to prepare, which screenshots to send, and what affects the price.",
};

/**
 * The seller page.
 *
 * There is no registration, no login, no dashboard and no submission form —
 * every seller conversation happens on social media. So the job of this page is
 * narrow and worth doing well: tell someone exactly what to gather before they
 * message, so their first message is a useful one.
 */
export default function SellPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-col gap-4">
        <h1 className="text-[length:var(--text-2xl)] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[length:var(--text-3xl)]">
          Sell your Mobile Legends account
        </h1>
        <p className="max-w-[65ch] text-[length:var(--text-md)] leading-relaxed text-ink-2">
          Send us what you have and we will tell you what it is worth. There is
          no form to fill in and no account to create — everything happens in a
          conversation, and you are free to walk away at any point.
        </p>
      </header>

      <div className="mt-8">
        <SellCTA
          heading="Ready to send it over?"
          body="Message us with your account details and screenshots. If you are not sure what to include, everything below explains it."
        />
      </div>

      <Section title="How it works">
        {/* A genuine sequence, so the numbers carry meaning rather than
            decorating the section. */}
        <ol className="flex flex-col gap-5">
          {SELL_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[length:var(--text-sm)] font-medium text-accent-ink"
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <p className="max-w-[65ch] leading-relaxed text-ink-2">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="What to have ready"
        lead="Send these in your first message and we can usually give you a figure straight away."
      >
        <dl className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface">
          {SELL_PREPARE.map((item, index) => (
            <div
              key={item.label}
              className={`flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:gap-6 ${
                index > 0 ? "border-t border-[var(--border)]" : ""
              }`}
            >
              <dt className="font-medium text-ink sm:w-40 sm:shrink-0">
                {item.label}
              </dt>
              <dd className="text-ink-2">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        title="Screenshots we need"
        lead="Clear, uncropped, straight from the game. Buyers decide on these, so a good set is worth the few minutes it takes."
      >
        <ul className="flex flex-col gap-3">
          {SELL_SCREENSHOTS.map((shot) => (
            <li
              key={shot.title}
              className="flex flex-col gap-0.5 border-t border-[var(--border)] pt-3 first:border-t-0 first:pt-0"
            >
              <h3 className="font-medium text-ink">{shot.title}</h3>
              <p className="max-w-[65ch] text-ink-2">{shot.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="What affects the price"
        lead="So the valuation we come back with is not a surprise."
      >
        <ul className="flex flex-col gap-4">
          {SELL_VALUE_FACTORS.map((factor) => (
            <li key={factor.title} className="flex flex-col gap-0.5">
              <h3 className="font-medium text-ink">{factor.title}</h3>
              <p className="max-w-[65ch] leading-relaxed text-ink-2">
                {factor.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-10">
        <SellCTA
          heading="Send us your account"
          body="Message us with the details and screenshots above, and we will come back to you with a valuation."
          showFollow
        />
      </div>
    </div>
  );
}

function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:mt-12">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[length:var(--text-lg)] font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {lead && <p className="max-w-[65ch] text-ink-2">{lead}</p>}
      </div>
      {children}
    </section>
  );
}
