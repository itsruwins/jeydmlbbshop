"use client";

import { useState } from "react";

import { SocialButtons } from "@/components/shared/SocialButtons";
import { listingMessage } from "@/lib/utils/contactMessage";
import { cn } from "@/lib/utils/cn";
import type { AccountStatus } from "@/types/account";
import type { SocialLink } from "@/types/socialLink";

/**
 * The buyer's only action on the site.
 *
 * There is no checkout — the whole point of this page is to hand the
 * conversation to social media with enough context that the seller knows
 * immediately which account is meant. That context is the reference and the
 * price, written into a message the buyer can send as-is.
 *
 * Reserved and sold listings keep a contact route rather than losing it. Someone
 * looking at a sold account is a buyer with proven taste, and "ask about
 * something similar" is a better outcome than a dead end.
 */
export function ContactCTA({
  reference,
  price,
  status,
  socialLinks,
}: {
  reference: string;
  /** Quoted in the message, so it records what the buyer was looking at. */
  price: number | null;
  status: AccountStatus;
  socialLinks: SocialLink[];
}) {
  const [copied, setCopied] = useState(false);

  const isAvailable = status === "available";

  const message = listingMessage({ reference, price, status });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused (insecure context, permissions).
      // The message is on screen and selectable either way.
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-ink">
          {isAvailable
            ? "Interested in this account?"
            : "Looking for something like this?"}
        </h2>
        <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-2">
          {isAvailable
            ? "Message us and we'll answer your questions and arrange the handover directly."
            : "This one is no longer available, but message us and we'll tell you what else we have."}
        </p>
      </div>

      <SocialButtons
        links={socialLinks}
        message={message}
        emptyNotice="Contact details are being set up. Please check back shortly."
      />

      {/* The message, shown in full rather than described.

          It is here for two reasons. A buyer can see exactly what they are
          about to send before they send it — nobody likes pasting text they
          have not read — and it is the fallback for every case where the
          clipboard write above is refused, which is common inside in-app
          browsers. Both controls copy the same string, so it does not matter
          which one is used, or in which order. */}
      <div className="flex items-start justify-between gap-3 rounded-[var(--radius)] bg-surface-2 px-3 py-2.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[length:var(--text-xs)] text-ink-3">
            Your message
          </span>
          <span className="text-[length:var(--text-sm)] leading-relaxed text-ink">
            {message}
          </span>
        </div>

        <button
          type="button"
          onClick={copy}
          className={cn(
            "shrink-0 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[length:var(--text-sm)]",
            "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
            copied
              ? "text-[var(--success-ink)]"
              : "text-ink-2 hover:bg-surface-3 hover:text-ink",
          )}
        >
          {copied ? "Copied" : "Copy"}
          <span className="sr-only"> message</span>
        </button>
      </div>
    </div>
  );
}
