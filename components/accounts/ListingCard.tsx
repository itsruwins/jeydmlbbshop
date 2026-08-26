import Link from "next/link";

import { ScreenshotCarousel } from "@/components/accounts/ScreenshotCarousel";
import {
  CrownIcon,
  GemIcon,
  HeroIcon,
  SparkIcon,
} from "@/components/home/specIcons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { orderedImages } from "@/lib/utils/accountImages";
import { cn } from "@/lib/utils/cn";
import { formatCount, formatPrice } from "@/lib/utils/format";
import type { AccountWithRelations } from "@/types/account";

/**
 * One listing, everywhere a listing appears.
 *
 * ## Why there is only one of these now
 *
 * There were two: a shelf tile on the homepage and a card in the catalogue.
 * They started as the same idea and drifted — different price treatments,
 * different metadata, a nameplate on one and a footnote on the other — so a
 * buyer who tapped through from the storefront met a listing that looked like
 * a different shop's. Neither was wrong; having two was. The shelf tile won on
 * every point that was actually in dispute, so it is what survived, and the
 * catalogue's one genuine addition — a status on sold and reserved listings —
 * came with it.
 *
 * ## The parts, and why each one sits where it does
 *
 * **The reference is a plate on the artwork, top left.** It is the only thing
 * on the card that identifies *this* account — two Mythical Immortals with
 * similar skin counts are told apart by nothing else — and it is what a buyer
 * quotes back in the first message. As quiet metadata under the price it was
 * losing to everything around it.
 *
 * The plate is `--accent-fill` with an `--accent` border rather than white:
 * white belongs to the screenshots, not to this site, and a white sticker on
 * the artwork reads as browser furniture pasted over the picture. The border
 * takes the *lit* accent because on a dark frame the deep plate and a deep
 * border both vanish and the chip loses its edge; the scrim above covers the
 * opposite case, a pale frame.
 *
 * **The status goes top right**, opposite the reference, because both are
 * plates on the same strip of artwork and stacking them would make a pile.
 *
 * **The price is a swing tag straddling the bottom edge of the image**, pulled
 * up by a negative margin rather than positioned inside the frame — the frame
 * is `overflow-hidden` for the hover zoom, so anything hanging off it would be
 * clipped. `relative z-10` is load-bearing: the image box is positioned and
 * this is not, so without it the artwork paints over the tag and cuts it in
 * half.
 *
 * **Four facts, one per line, each anchored by a mark.** Skins and heroes
 * shared a row until the marks gave that away as a compromise — the hero icon
 * began wherever the skin number happened to end, so it landed somewhere
 * different on every card and read as debris rather than as a column. One fact
 * per line puts all four marks on a single left edge.
 *
 * The 16:10 frame is not arbitrary. Mobile Legends is played in landscape and
 * screenshots arrive at roughly 1.6:1 — a measured sample is 1600x1001. A 4:3
 * frame would crop about 17% off a shot like that, and the cropped strip is
 * exactly where the rank and collection numbers sit.
 *
 * Sold and reserved cards are dimmed rather than removed. For a shop this size
 * they are the only evidence that sales actually happen. The dimming lifts on
 * hover so the details stay readable.
 *
 * It is an `article` with links inside rather than one link wrapped around
 * everything because the frame holds its own controls, and a button inside an
 * anchor is invalid and unreachable by keyboard.
 */
export function ListingCard({
  account,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24rem",
}: {
  account: AccountWithRelations;
  /** Set on the first few cards so the LCP image is not lazy-loaded. */
  priority?: boolean;
  sizes?: string;
}) {
  const images = orderedImages(account.images);
  const href = `/accounts/${account.account_reference}`;
  const isClosed = account.status !== "available";

  return (
    <article
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)]",
        "border border-[var(--border)] bg-surface",
        "transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
        "hover:border-[var(--border-strong)] motion-safe:hover:-translate-y-1",
      )}
    >
      <ScreenshotCarousel
        images={images}
        href={href}
        label={account.account_reference}
        sizes={sizes}
        priority={priority}
        dimmed={isClosed}
      >
        {/* Both plates are `pointer-events-none`: the slide underneath is the
            link, and a plate that swallowed the tap would leave a dead corner
            on the picture. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[oklch(0_0_0/0.45)] to-transparent"
        />

        <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-[var(--radius-sm)] border border-accent/45 bg-accent-fill px-2 py-1 font-mono text-[length:var(--text-sm)] font-semibold leading-none tracking-[0.02em] text-on-accent-fill shadow-[0_1px_8px_oklch(0_0_0/0.45)]">
          {account.account_reference}
        </span>

        {isClosed && (
          <div className="pointer-events-none absolute right-3 top-3 z-20">
            <StatusBadge status={account.status} />
          </div>
        )}
      </ScreenshotCarousel>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <span className="price-tag display tabular relative z-10 -mt-9 mb-0.5 w-fit bg-accent-fill text-[length:var(--text-xl)] leading-none text-on-accent-fill">
          {formatPrice(account.price)}
        </span>

        {/* A list rather than a `<dl>`: `dl` only permits `dt`/`dd`/`div` as
            children, and each mark needs a wrapper. The hidden labels carry
            what the icons cannot say. */}
        <ul className="flex flex-col gap-2 text-[length:var(--text-sm)]">
          <li className="flex items-center gap-2">
            <CrownIcon />
            <span className="sr-only">Rank:</span>
            <span className="truncate font-medium text-ink">
              {account.rank?.name ?? "Unranked"}
            </span>
          </li>

          {account.collection_level && (
            <li className="flex items-center gap-2">
              <GemIcon />
              <span className="sr-only">Collection level:</span>
              <span className="truncate font-medium text-ink">
                {account.collection_level.name}
              </span>
            </li>
          )}

          {account.skin_count !== null && (
            <li className="flex items-center gap-2">
              <SparkIcon />
              <span className="text-ink-3">
                <span className="tabular font-medium text-ink">
                  {formatCount(account.skin_count)}
                </span>{" "}
                skins
              </span>
            </li>
          )}

          {account.hero_count !== null && (
            <li className="flex items-center gap-2">
              <HeroIcon />
              <span className="text-ink-3">
                <span className="tabular font-medium text-ink">
                  {formatCount(account.hero_count)}
                </span>{" "}
                heroes
              </span>
            </li>
          )}
        </ul>

        {/* The card's keyboard route in, and the only part of it in the tab
            order — the slides are deliberately not. The reference rides along
            unseen so a screen reader hears which account this belongs to. */}
        <Link
          href={href}
          className="mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-surface-3 text-[length:var(--text-sm)] font-medium text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:bg-accent-fill group-hover:text-on-accent-fill"
        >
          View account
          <span className="sr-only">{account.account_reference}</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-[var(--dur)] ease-[var(--ease-out)] motion-safe:group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
