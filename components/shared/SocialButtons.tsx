"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { contactUrl } from "@/lib/utils/contactUrl";
import { openContact } from "@/lib/utils/openContact";
import type { SocialLink } from "@/types/socialLink";

/**
 * The outbound social buttons, shared by the buyer CTA and the seller page so
 * the two cannot drift apart in appearance or behaviour.
 *
 * The first active link is the primary action; the rest sit beside it. Order
 * comes from `social_links.display_order`, so which platform leads is a
 * database decision rather than a code one.
 *
 * ## Why some platforms copy and others do not
 *
 * WhatsApp and Telegram accept the message as a `text` parameter, so the buyer
 * arrives with it already typed and only has to press send. Messenger has no
 * equivalent — there is no supported way to put words in someone's compose box
 * from a link, and for a personal profile (as opposed to a Page) `m.me` will
 * not even open a chat.
 *
 * So for those destinations the button copies the message to the clipboard on
 * the way out. The buyer lands in the chat and pastes. That is one extra tap,
 * and it is the shortest honest path: the alternative is asking someone to type
 * a reference they have to scroll back to find, which is where wrong-listing
 * conversations come from.
 *
 * The copy happens inside the click, before the new tab opens, because
 * clipboard access is only granted during a user gesture.
 */

/** The label is what the button says, so it can never be blank. */
function nameOf(link: SocialLink): string {
  return link.label?.trim() || link.platform?.trim() || "social media";
}

export function SocialButtons({
  links,
  message,
  emptyNotice,
}: {
  links: SocialLink[];
  /** Pre-filled where the platform documents a parameter for it. */
  message: string;
  emptyNotice: string;
}) {
  const [copied, setCopied] = useState(false);

  if (links.length === 0) {
    return (
      <p className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-3.5 py-3 text-[length:var(--text-sm)] text-ink-2">
        {emptyNotice}
      </p>
    );
  }

  const handle = (link: SocialLink) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (openContact(link.url, message)) setCopied(true);
  };

  const [primary, ...others] = links;

  return (
    <div className="flex flex-col gap-2">
      {/* A real href, so the link survives a middle-click, a long-press, or
          anything else that does not run our handler. The handler only adds the
          clipboard write on the way out. */}
      <a
        href={contactUrl(primary.url, message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handle(primary)}
        className="contents"
      >
        <Button variant="primary" className="w-full">
          Message us on {nameOf(primary)}
        </Button>
      </a>

      {others.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {others.map((link) => (
            <a
              key={link.id}
              href={contactUrl(link.url, message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handle(link)}
              className="flex-1"
            >
              <Button variant="secondary" className="w-full">
                {nameOf(link)}
              </Button>
            </a>
          ))}
        </div>
      )}

      {/* Stays until the page changes. The buyer is in another tab by now, and
          this is what they come back to if the paste did not land. */}
      {copied && (
        <p
          role="status"
          className="text-[length:var(--text-sm)] leading-relaxed text-accent-ink"
        >
          Message copied — paste it into the chat and send.
        </p>
      )}
    </div>
  );
}
