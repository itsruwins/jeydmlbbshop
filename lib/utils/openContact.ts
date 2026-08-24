import { contactUrl, supportsPrefill } from "@/lib/utils/contactUrl";

/**
 * Opens a social destination, copying the message first where the platform
 * cannot carry it.
 *
 * Shared by every "message us" control on the site, because the sequencing is
 * the part that is easy to get wrong and expensive to get wrong twice:
 *
 *   • The copy is not awaited. Awaiting moves `window.open` out of the user
 *     gesture and into a popup blocker. A failed copy is recoverable — the
 *     message is on screen beside a Copy button — but a blocked tab is not.
 *   • Platforms that accept a `text` parameter are left alone entirely. The
 *     buyer arrives with the message typed, so copying it would only overwrite
 *     their clipboard for no reason.
 *
 * Returns true when the message was copied, so the caller can say so.
 */
export function openContact(url: string, message: string): boolean {
  const prefilled = supportsPrefill(url);

  if (!prefilled) {
    navigator.clipboard?.writeText(message).catch(() => {
      // Refused in an insecure context or by permissions. Nothing to recover:
      // every caller shows the message on screen as well.
    });
  }

  window.open(contactUrl(url, message), "_blank", "noopener,noreferrer");

  return !prefilled;
}
