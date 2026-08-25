import Link from "next/link";

import { FollowLinks } from "@/components/shared/FollowLinks";
import { getSocialLinks } from "@/functions/socialLinks/getSocialLinks";
import { SHOP } from "@/lib/constants/shop";

/**
 * The footer: a sign-off, not a second homepage.
 *
 * It used to restate the shop's name, then the hero's pitch, then the header's
 * two nav items, then the socials as text — four things the visitor had
 * already read, stacked in a block deep enough to look like a section. A
 * footer that repeats the page teaches people there is nothing down here.
 *
 * What is left is what a footer is actually for: where you are, the two places
 * you can go, where else to find us, and the disclaimer that has to appear
 * somewhere. One row, then the legal line.
 *
 * Both kinds of social link appear here, as icons. The footer answers "where
 * else are you?" rather than "how do I ask about this listing?", so the
 * message-us machinery is deliberately absent — these are plain links to the
 * profiles, pointing at the stored URL, unrewritten.
 */
export async function SiteFooter() {
  const socials = await getSocialLinks();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-surface-2">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          {/* The wordmark alone. On a page that opens with the same name in the
              header, a description underneath it is the third telling. */}
          <p className="wordmark text-[length:var(--text-lg)] text-ink">
            {SHOP.name}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* -my-2 keeps the visual rhythm while the links themselves grow to
                a 44px target. Standalone navigation, not prose links, so the
                inline-text exemption does not apply. */}
            <nav
              aria-label="Footer"
              className="-my-2 flex flex-col sm:flex-row sm:items-center sm:gap-6"
            >
              <Link
                href="/accounts"
                className="flex min-h-11 items-center text-[length:var(--text-sm)] text-ink-2 underline-offset-2 hover:text-ink hover:underline"
              >
                Browse accounts
              </Link>
              <Link
                href="/sell"
                className="flex min-h-11 items-center text-[length:var(--text-sm)] text-ink-2 underline-offset-2 hover:text-ink hover:underline"
              >
                Sell your account
              </Link>
            </nav>

            {socials.length > 0 && (
              <>
                {/* A hairline instead of a caption. In a single row the icons
                    read as "find us" from their position; on a phone the row
                    stacks and the rule would be pointing at nothing. */}
                <span
                  aria-hidden="true"
                  className="hidden h-5 w-px bg-[var(--border)] sm:block"
                />
                <FollowLinks
                  links={socials}
                  variant="solid"
                  label="Find us on"
                />
              </>
            )}
          </div>
        </div>

        <p className="border-t border-[var(--border)] pt-5 text-[length:var(--text-sm)] text-ink-3">
          Not affiliated with or endorsed by Moonton.
        </p>
      </div>
    </footer>
  );
}
