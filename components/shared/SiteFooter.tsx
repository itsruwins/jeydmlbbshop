import Link from "next/link";

import { getSocialLinks } from "@/functions/socialLinks/getSocialLinks";
import { SHOP } from "@/lib/constants/shop";

/**
 * The footer, including the social destinations.
 *
 * Links come from the `social_links` table rather than being written here, so
 * changing a handle is an admin edit rather than a code change. If the table is
 * empty the social row simply does not render — better than shipping a dead
 * link.
 *
 * These point at the stored URL, as does every other social link on the site.
 * Nothing is rewritten anywhere — the admin decides the exact destination and
 * can test it before saving.
 *
 * The label falls back to the platform name, so a row saved without one still
 * renders something clickable instead of an invisible link.
 */
export async function SiteFooter() {
  const socials = await getSocialLinks();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-surface-2">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <p className="wordmark text-[length:var(--text-lg)] text-ink">
              {SHOP.name}
            </p>
            <p className="max-w-sm text-[length:var(--text-sm)] text-ink-3">
              Mobile Legends accounts, listed with full screenshots. Every deal
              is arranged directly with us.
            </p>
          </div>

          {/* -my-2 keeps the visual rhythm while the links themselves grow to
              a 44px target. Standalone navigation, not prose links, so the
              inline-text exemption does not apply. */}
          <nav aria-label="Footer" className="-my-2 flex flex-col">
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
        </div>

        {socials.length > 0 && (
          <div className="-my-2 flex flex-wrap gap-x-4 border-t border-[var(--border)] pt-6">
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                // noreferrer alongside noopener: the destination has no reason
                // to learn which page sent the visitor.
                rel="noopener noreferrer"
                className="flex min-h-11 items-center text-[length:var(--text-sm)] text-ink-2 underline-offset-2 hover:text-ink hover:underline"
              >
                {social.label?.trim() || social.platform}
              </a>
            ))}
          </div>
        )}

        <p className="text-[length:var(--text-sm)] text-ink-3">
          Not affiliated with or endorsed by Moonton.
        </p>
      </div>
    </footer>
  );
}
