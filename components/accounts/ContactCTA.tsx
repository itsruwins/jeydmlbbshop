"use client";

import { useState } from "react";

import { SocialButtons } from "@/components/shared/SocialButtons";
import { cn } from "@/lib/utils/cn";
import type { AccountStatus } from "@/types/account";
import type { SocialLink } from "@/types/socialLink";

/**
 * The buyer's only action on the site.
 *
 * There is no checkout — the whole point of this page is to hand the
 * conversation to social media with enough context that the seller knows
 * immediately which account is meant. That context is the reference, so it is
 * pre-filled into the message where the platform allows it and copyable
 * everywhere else.
 *
 * Reserved and sold listings keep a contact route rather than losing it. Someone
 * looking at a sold account is a buyer with proven taste, and "ask about
 * something similar" is a better outcome than a dead end.
 */
export function ContactCTA({
  reference,
  title,
  status,
  socialLinks,
}: {
  reference: string;
  title: string | null;
  status: AccountStatus;
  socialLinks: SocialLink[];
}) {
  const [copied, setCopied] = useState(false);

  const isAvailable = status === "available";

  const message = isAvailable
    ? `Hi! I'm interested in account ${reference}${title ? ` (${title})` : ""}.`
    : `Hi! I saw account ${reference} is ${status}. Do you have anything similar?`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused (insecure context, permissions).
      // The reference is on screen either way, so there is nothing to recover.
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

      {/* Always present, because most platforms cannot pre-fill a message and
          the reference is what identifies the account in a chat. */}
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] bg-surface-2 px-3 py-2.5">
        <div className="flex min-w-0 flex-col">
          <span className="text-[length:var(--text-xs)] text-ink-3">
            Quote this reference
          </span>
          <span className="truncate font-mono text-ink">{reference}</span>
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
          <span className="sr-only"> account reference</span>
        </button>
      </div>
    </div>
  );
}
