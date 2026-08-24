"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { contactUrl } from "@/lib/utils/contactUrl";
import { openContact } from "@/lib/utils/openContact";
import type { SocialLink } from "@/types/socialLink";

/**
 * A single "message us" button, for places that are not the CTA panel — the
 * homepage hero, the empty-stock notice.
 *
 * It confirms the copy *in its own label* rather than with a note beneath it.
 * Those call sites put this button in a flex row beside another one, where an
 * extra sibling element would break the row; a label that changes for a moment
 * says the same thing and cannot disturb the layout around it.
 */
export function ContactButton({
  link,
  message,
  label,
  variant = "secondary",
  className,
}: {
  link: SocialLink;
  message: string;
  label: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // The tab that opened is not this page's problem, but the timer is: leaving
  // it running against an unmounted component is a state update on nothing.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <a
      href={contactUrl(link.url, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        event.preventDefault();

        if (openContact(link.url, message)) {
          setCopied(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), 4000);
        }
      }}
      className={className}
    >
      <Button variant={variant} className="w-full sm:w-auto sm:px-6">
        {copied ? "Copied — paste it in the chat" : label}
      </Button>
    </a>
  );
}
