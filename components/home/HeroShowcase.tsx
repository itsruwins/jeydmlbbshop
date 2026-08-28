"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  CrownIcon,
  FrameIcon,
  GemIcon,
  HeroIcon,
  SparkIcon,
} from "@/components/home/specIcons";
import { cn } from "@/lib/utils/cn";
import { formatCount, formatPrice } from "@/lib/utils/format";
import { imagePublicUrl } from "@/lib/utils/imagePublicUrl";
import type { AccountWithRelations } from "@/types/account";

/** The cover, or the first image, or nothing. */
function coverImage(account: AccountWithRelations) {
  const images = account.images ?? [];
  return (
    images.find((image) => image.is_cover) ??
    [...images].sort((a, b) => a.display_order - b.display_order)[0] ??
    null
  );
}

const ADVANCE_MS = 5200;

/**
 * The hero's right-hand panel: a real listing, at the size a listing deserves.
 *
 * This is the whole argument of the redesign. Every competitor — PlayerAuctions,
 * G2G, PlayHub, GameMarket — opens with a paragraph of prose and shows nothing
 * for sale until you click a category. The one thing this shop has that they do
 * not is a small, fully-photographed inventory, so the front page puts it in the
 * first fold at full size: the screenshot, the price, the specification, live
 * from the database.
 *
 * With more than one account in stock the panel cycles, which does two jobs at
 * once — it shows depth without needing a grid, and it means the hero is never
 * a single static object no matter how small the inventory is.
 *
 * The cycle stops on hover, on keyboard focus, and whenever the visitor has
 * asked for reduced motion. It also stops the moment someone picks a listing
 * themselves: a carousel that keeps moving after you have chosen is a carousel
 * that takes the page away from you.
 */
export function HeroShowcase({
  accounts,
}: {
  accounts: AccountWithRelations[];
}) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const chosen = useRef(false);

  useEffect(() => {
    if (accounts.length < 2 || held || chosen.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % accounts.length),
      ADVANCE_MS,
    );
    return () => window.clearInterval(id);
  }, [accounts.length, held]);

  if (accounts.length === 0) return null;

  const account = accounts[Math.min(index, accounts.length - 1)];
  const cover = coverImage(account);

  /* How many screenshots back the listing up.

     Every marketplace quotes skins and heroes; none of them tell you how much
     of the account you can actually see before paying, which is this shop's
     whole argument. It is also live — it counts the images that exist, so it
     cannot drift from the truth. */
  const shotCount = account.images?.length ?? 0;

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <Link
        href={`/accounts/${account.account_reference}`}
        className={cn(
          "group block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)]",
          "bg-surface shadow-[var(--shadow-dialog)]",
          "transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
          "hover:border-[var(--border-strong)] motion-safe:hover:-translate-y-1",
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-3">
          {cover ? (
            <Image
              // `key` on the src forces a fresh element per listing, so the
              // crossfade below actually plays instead of the browser swapping
              // the bitmap inside one img and showing a hard cut.
              key={cover.storage_path}
              src={imagePublicUrl(cover.storage_path)}
              alt={cover.alt_text ?? `Account ${account.account_reference}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className="motion-safe:animate-[reveal-up_var(--dur-slow)_var(--ease-out)] object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-safe:group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[length:var(--text-sm)] text-ink-3">
              No screenshot yet
            </div>
          )}

          {/* The nameplate and the stock mark, in the shelf tile's material.

              Both were white chips: the loudest thing in the fold, and a
              colour that belongs to the screenshots rather than to this site,
              so they read as browser affordances pasted over the artwork. The
              reference now takes the same oxblood plate the shelf gives it —
              --accent-fill is the token for a filled plate that is not a
              status and not a control — with the lit --accent as its border,
              because on a dark frame of a screenshot a deep plate and a deep
              border disappear together.

              "In stock" is the one thing here that is not the shop's own
              voice, so it stays neutral: smoked glass over the picture,
              quieter than the plate opposite it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[oklch(0_0_0/0.5)] to-transparent"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
            <span className="rounded-[var(--radius-sm)] border border-accent/45 bg-accent-fill px-2 py-1 font-mono text-[length:var(--text-sm)] font-semibold leading-none tracking-[0.02em] text-on-accent-fill shadow-[0_1px_8px_oklch(0_0_0/0.45)]">
              {account.account_reference}
            </span>
            <span className="rounded-full border border-[oklch(1_0_0/0.22)] bg-[oklch(0_0_0/0.5)] px-2.5 py-1 text-[length:var(--text-xs)] font-medium leading-[1.4] text-[oklch(0.98_0_0)] backdrop-blur-sm">
              In stock
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          {/* The price as a swing tag, the way the shelf sets it, pulled up
              over the artwork by a negative margin rather than positioned
              inside it: the image sits in an overflow-hidden box for the hover
              zoom, so anything hanging off its bottom edge would be clipped.

              ## Size

              It was set at --display-2, which is the heading step — at full
              width a 42px plate roughly 230px across, laid over the middle of
              the screenshot it is meant to be pricing. The plate is the only
              lit oxblood on the card and it hangs half off an edge; it does
              not need heading weight on top of that to be found. --text-2xl
              is one step down from where it was and one step up from the
              shelf tile's --text-xl, which is the hierarchy this card wants:
              louder than a tile in the grid, quieter than the screenshot.

              It is also a fixed step rather than a clamp, so the plate is the
              same height at every width and the pull below can be one number
              per padding rather than a range that drifts with the viewport.

              `relative z-10` is load-bearing. The image box is positioned and
              this one is not, so without it the image paints on top and cuts
              the price in half. The pull is tied to this card's padding — 1.25
              then 1.5rem — so roughly half of the ~50px plate hangs below the
              image at both widths. Change the padding or the size and this
              moves with them. */}
          <span className="price-tag display tabular relative z-10 -mt-11 mb-1 w-fit bg-accent-fill text-[length:var(--text-2xl)] leading-none text-on-accent-fill [filter:drop-shadow(0_2px_4px_oklch(0_0_0/0.45))] sm:-mt-12">
            {formatPrice(account.price)}
          </span>

          {/* The specification, each fact anchored by a mark — the shelf tile's
              list rather than the divided metric row that used to sit here.
              That row set three numbers in three bordered cells and left rank
              and collection level stranded above the price as a separate line
              of accent text, so one card carried two different ways of stating
              a fact. This is one way, and it is the same one the shelf uses.

              A list rather than a `<dl>`: the metrics need to sit several to a
              row, and `dl` only permits `dt`/`dd`/`div` as children. The hidden
              labels carry what the icons cannot say. */}
          <ul className="flex flex-col gap-2.5 text-[length:var(--text-md)]">
            <li className="flex items-center gap-2.5">
              <CrownIcon />
              <span className="sr-only">Rank:</span>
              <span className="truncate font-medium text-ink">
                {account.rank?.name ?? "Unranked"}
              </span>
            </li>

            {account.collection_level && (
              <li className="flex items-center gap-2.5">
                <GemIcon />
                <span className="sr-only">Collection level:</span>
                <span className="truncate font-medium text-ink">
                  {account.collection_level.name}
                </span>
              </li>
            )}

            {/* Skins, heroes and the screenshot count share a row: they are the
                numbers a buyer reads together, and stacking them would make
                six lines out of three facts. */}
            <li className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <span className="flex items-center gap-2.5">
                <SparkIcon />
                <span className="text-ink-3">
                  <span className="tabular font-medium text-ink">
                    {formatCount(account.skin_count, account.skin_count_is_min)}
                  </span>{" "}
                  skins
                </span>
              </span>

              {account.hero_count !== null && (
                <span className="flex items-center gap-2.5">
                  <HeroIcon />
                  <span className="text-ink-3">
                    <span className="tabular font-medium text-ink">
                      {formatCount(account.hero_count, account.hero_count_is_min)}
                    </span>{" "}
                    heroes
                  </span>
                </span>
              )}

              <span className="flex items-center gap-2.5">
                <FrameIcon />
                <span className="text-ink-3">
                  <span className="tabular font-medium text-ink">
                    {formatCount(shotCount)}
                  </span>{" "}
                  {shotCount === 1 ? "screenshot" : "screenshots"}
                </span>
              </span>
            </li>
          </ul>

          {/* The action, at the size of an action. The shelf tile keeps its
              equivalent quiet until hover because there are three of them on
              screen at once; this is the only one in the fold and the page's
              way in, so it stays filled.

              A span, not a button: the whole card is already one link, and a
              button inside an anchor is invalid and unreachable by keyboard. */}
          <span
            className={cn(
              "mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius)]",
              "bg-primary text-[length:var(--text-base)] font-medium text-on-primary",
              "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
              "group-hover:bg-primary-hover",
            )}
          >
            See everything
            <span
              aria-hidden="true"
              className="transition-transform duration-[var(--dur)] ease-[var(--ease-out)] motion-safe:group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </div>
      </Link>

      {/* Which listing is showing, and a way to choose. Rendered as real
          buttons with names rather than anonymous dots — "slide 2 of 3" is
          useless to anyone who cannot see the panel. */}
      {accounts.length > 1 && (
        <div
          role="tablist"
          aria-label="Accounts in stock"
          className="flex items-center gap-2 px-1"
        >
          {accounts.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${item.account_reference}`}
              onClick={() => {
                chosen.current = true;
                setIndex(i);
              }}
              className={cn(
                "hit-target h-1.5 flex-1 rounded-full transition-colors duration-[var(--dur)]",
                i === index ? "bg-accent" : "bg-[var(--border)] hover:bg-[var(--border-strong)]",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
