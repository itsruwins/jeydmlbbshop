"use client";

import { Button } from "@/components/ui/Button";
import { contactUrl } from "@/lib/utils/contactUrl";
import type { SocialLink } from "@/types/socialLink";

/**
 * The outbound social buttons, shared by the buyer CTA and the seller page so
 * the two cannot drift apart in appearance or behaviour.
 *
 * The first active link is the primary action; the rest sit beside it. Order
 * comes from `social_links.display_order`, so which platform leads is a
 * database decision rather than a code one.
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
  if (links.length === 0) {
    return (
      <p className="rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 px-3.5 py-3 text-[length:var(--text-sm)] text-ink-2">
        {emptyNotice}
      </p>
    );
  }

  const [primary, ...others] = links;

  return (
    <div className="flex flex-col gap-2">
      <a
        href={contactUrl(primary.url, message)}
        target="_blank"
        rel="noopener noreferrer"
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
              className="flex-1"
            >
              <Button variant="secondary" className="w-full">
                {nameOf(link)}
              </Button>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
