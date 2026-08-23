/**
 * Turns a stored social link into the URL a "message us" button should open.
 *
 * The rule is deliberately narrow: **what the admin pastes is what the buyer
 * gets**, with one exception — platforms that accept a pre-filled message get
 * one, because that is a documented query parameter rather than a guess about
 * how the destination is structured.
 *
 * There used to be a second transformation here: `facebook.com/<handle>` was
 * rewritten to `m.me/<handle>` so the button opened a chat instead of a
 * timeline. It was removed because it does not work.
 *
 * `m.me` is a Pages feature. Probing it shows why:
 *
 *   m.me/facebook  (a Page)    -> /t/20531316728/?messaging_source=source:pages:messaging
 *   m.me/heifcs    (a profile) -> /t/100057086983166/?handler=m.me
 *
 * A Page link carries a pages-messaging context; a personal profile link does
 * not, and opening that thread as someone who is not connected to the account
 * is refused with "This content isn't available right now". It failed from two
 * different accounts. A rewrite that silently produces a dead button — and that
 * the admin has no way to notice — is worse than no rewrite at all.
 *
 * The admin form still *suggests* the Messenger form of a Facebook link, as a
 * clickable link the admin can test and choose. Suggesting is safe where
 * rewriting was not.
 */

/** Hosts whose links accept a `text` query parameter as a pre-filled message. */
const SUPPORTS_TEXT = [
  "wa.me",
  "api.whatsapp.com",
  "web.whatsapp.com",
  "t.me",
  "telegram.me",
];

const FACEBOOK_HOSTS = [
  "facebook.com",
  "web.facebook.com",
  "m.facebook.com",
  "fb.com",
];

/** Facebook paths that are not page handles. */
const NOT_A_HANDLE = new Set([
  "pages",
  "groups",
  "events",
  "marketplace",
  "watch",
  "gaming",
  "share",
  "sharer.php",
  "dialog",
  "permalink.php",
  "story.php",
  "photo.php",
  "media",
  "hashtag",
  "people",
  "p",
]);

function stripWww(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

export function contactUrl(url: string, message: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Not a parseable absolute URL. Hand it back rather than throwing during a
    // page render — a bad link is the admin's to fix, not a reason to 500.
    return url;
  }

  const host = stripWww(parsed.hostname);
  if (!SUPPORTS_TEXT.includes(host)) return url;

  // Don't overwrite a message the stored link already carries.
  if (parsed.searchParams.has("text")) return url;

  parsed.searchParams.set("text", message);
  return parsed.toString();
}

/** True when this destination will arrive with the message already typed. */
export function supportsPrefill(url: string): boolean {
  try {
    return SUPPORTS_TEXT.includes(stripWww(new URL(url).hostname));
  } catch {
    return false;
  }
}

/**
 * The Messenger form of a Facebook link, offered to the admin as a suggestion.
 *
 * Returns null when the URL is not a convertible Facebook link — a group, a
 * post, or anything already pointing at Messenger.
 *
 * This is only ever *shown*. Nothing applies it automatically, because whether
 * it works depends on the destination being a Page, which cannot be determined
 * from the URL.
 */
export function suggestMessengerUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (!FACEBOOK_HOSTS.includes(stripWww(parsed.hostname))) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  if (segments[0] === "profile.php") {
    const id = parsed.searchParams.get("id");
    return id && /^\d+$/.test(id) ? `https://m.me/${id}` : null;
  }

  if (segments.length !== 1) return null;

  const handle = segments[0];
  if (NOT_A_HANDLE.has(handle.toLowerCase())) return null;
  if (!/^[A-Za-z0-9.]+$/.test(handle)) return null;

  return `https://m.me/${handle}`;
}
