import Link from "next/link";

import { formatCount, formatPrice } from "@/lib/utils/format";
import {
  CrownIcon,
  GemIcon,
  HeroIcon,
  SparkIcon,
} from "@/components/home/specIcons";
import { ScreenshotCarousel } from "@/components/accounts/ScreenshotCarousel";
import { orderedImages } from "@/lib/utils/accountImages";
import type { AccountWithRelations } from "@/types/account";

/**
 * Everything available, as a shelf of products.
 *
 * ## The column count is the whole trick
 *
 * A fixed three-column grid, not `auto-fit` or `auto-fill`. The columns exist
 * whether or not there is anything to put in them, so one account occupies one
 * 384px column and sits at the left under the heading — it stays the size of a
 * product. `auto-fit` collapses the empty tracks and hands a single listing the
 * entire width, which is how it ended up looking like a billboard; a sideways
 * rail solved that but left 40% of the row empty at three listings, because a
 * rail is built to overflow and this shop does not have enough stock to
 * overflow one yet. Three columns fills the row exactly at today's inventory
 * and wraps to a second row as it grows.
 *
 * ## The tile
 *
 * The price is a tag on the picture, not a line of text under it. On a shelf of
 * near-identical screenshots the price is what a buyer scans for, and lifting it
 * onto the artwork gives it somewhere to sit that is not another horizontal band
 * — the previous tile was five stacked strips inside a bordered card, with
 * dividers between the numbers and a bordered button at the bottom. A box inside
 * a box inside a box.
 *
 * The frame is browsable in place: one shop's argument is that every listing is
 * photographed end to end, and a shelf that shows one screenshot per account is
 * making that argument with the evidence hidden one click away. See
 * `ScreenshotCarousel` for how the controls are split between a pointer that
 * can hover and a thumb that can swipe.
 *
 * What is left below the image is a two-line identity and the numbers. The
 * screenshot count is gone: it was a metric invented to fill a third column
 * that no longer exists.
 */
export function StockShelf({ accounts }: { accounts: AccountWithRelations[] }) {
  if (accounts.length === 0) return null;

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => {
        const images = orderedImages(account.images);
        const href = `/accounts/${account.account_reference}`;
        return (
          <li key={account.id} className="flex">
            {/* An `article` rather than one big `Link`. The frame now holds
                its own controls, and a button inside an anchor is invalid and
                unreachable by keyboard — so the tile stopped being a single
                link and became a card with two ways in: the screenshot and the
                button under it, both pointing at the same listing. */}
            <article className="group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:border-[var(--border-strong)] motion-safe:hover:-translate-y-1">
              <ScreenshotCarousel
                images={images}
                href={href}
                label={account.account_reference}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
              >
                {/* The reference, as the tile's nameplate.

                    It is the only thing on the tile that identifies *this*
                    account — two Mythical Immortals with similar skin counts
                    are told apart by nothing else — and it is what a buyer
                    quotes back to us in the first message. Translucent black on
                    a busy MLBB profile screenshot made it the quietest element
                    on the card, below even the muted metric labels.

                    An oxblood plate rather than a white chip. White would be
                    louder still, but it belongs to the screenshots, not to this
                    site — the storefront is black and one deep red, and a plain
                    white sticker on the artwork reads as a browser affordance
                    pasted over the picture. --accent-fill is the token for
                    exactly this: a filled plate that is not a status and not a
                    control. It is the same material as the price tag below and
                    the process band further down the page, so the two marks on
                    the artwork are a matched pair, separated by size and shape
                    rather than by colour — the price stays first because it is
                    display-size and this is 13px mono.

                    The border is --accent, the lit value, not --accent-border:
                    on a dark frame of a screenshot the deep plate and the deep
                    border both disappear and the chip loses its edge. The scrim
                    covers the opposite case, a pale frame.

                    Both are `pointer-events-none`: the slide underneath is the
                    link, and a plate that swallows the tap would leave a dead
                    corner on the picture. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[oklch(0_0_0/0.45)] to-transparent"
                />
                <span className="pointer-events-none absolute left-3 top-3 rounded-[var(--radius-sm)] border border-accent/45 bg-accent-fill px-2 py-1 font-mono text-[length:var(--text-sm)] font-semibold leading-none tracking-[0.02em] text-on-accent-fill shadow-[0_1px_8px_oklch(0_0_0/0.45)]">
                  {account.account_reference}
                </span>
              </ScreenshotCarousel>

              <div className="flex flex-1 flex-col gap-3 p-4">
                {/* The tag. Pulled up over the image by a negative margin
                    rather than positioned inside it: the image sits in an
                    overflow-hidden box for the hover zoom, so anything hanging
                    off its bottom edge would be clipped.

                    `relative z-10` is load-bearing. The image box is positioned
                    and this one is not, so without it the image paints on top
                    and cuts the price in half. */}
                <span className="price-tag display tabular relative z-10 -mt-9 mb-0.5 w-fit bg-accent-fill text-[length:var(--text-xl)] leading-none text-on-accent-fill">
                  {formatPrice(account.price)}
                </span>

                {/* Four facts, each anchored by a mark, one to a line.

                    Skins and heroes shared a row until the marks gave that away
                    as a compromise: the hero icon started wherever the skin
                    number happened to end, so it landed in a different place on
                    every tile and read as debris rather than as a column. One
                    fact per line puts all four marks on a single left edge, and
                    the tile is one line taller for it.

                    A list rather than a `<dl>`: `dl` only permits `dt`/`dd`/
                    `div` as children, and the marks need a wrapper each. The
                    hidden labels carry what the icons cannot say. */}
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

                  <li className="flex items-center gap-2">
                    <SparkIcon />
                    <span className="text-ink-3">
                      <span className="tabular font-medium text-ink">
                        {formatCount(account.skin_count)}
                      </span>{" "}
                      skins
                    </span>
                  </li>

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

                {/* The tile's keyboard route in, and the only part of it in the
                    tab order — the slides are deliberately not. The reference
                    rides along unseen so that a screen reader hears which
                    account this button belongs to. */}
                <Link
                  href={href}
                  className="mt-auto flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-surface-3 text-[length:var(--text-sm)] font-medium text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:bg-accent-fill group-hover:text-on-accent-fill"
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
          </li>
        );
      })}
    </ul>
  );
}
