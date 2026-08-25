"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

  /* Skins, heroes, and how many screenshots back the listing up.

     The third one is the point. Every marketplace quotes skins and heroes;
     none of them tell you how much of the account you can actually see before
     paying, which is this shop's whole argument. It is also live — it counts
     the images that exist, so it cannot drift from the truth. */
  const metrics = [
    { value: formatCount(account.skin_count), label: "skins" },
    { value: formatCount(account.hero_count), label: "heroes" },
    {
      value: formatCount(account.images?.length ?? 0),
      label: (account.images?.length ?? 0) === 1 ? "screenshot" : "screenshots",
    },
  ];

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

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-[oklch(0_0_0/0.6)] to-transparent p-3">
            <span className="rounded-[var(--radius-sm)] bg-[oklch(1_0_0/0.94)] px-2 py-1 font-mono text-[length:var(--text-sm)] font-medium leading-none text-[oklch(0.18_0_0)]">
              {account.account_reference}
            </span>
            <span className="rounded-full bg-[oklch(1_0_0/0.94)] px-2.5 py-1 text-[length:var(--text-xs)] font-medium leading-[1.4] text-[oklch(0.18_0_0)]">
              In stock
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          {/* What this account *is*, before what it costs. Rank and collection
              level are the two things a buyer compares between listings, so
              they read as the product's name rather than as two more rows in a
              specification table. */}
          <p className="text-[length:var(--text-sm)] font-medium text-accent-ink">
            {account.rank?.name ?? "Unranked"}
            {account.collection_level && (
              <span className="text-ink-3"> · {account.collection_level.name}</span>
            )}
          </p>

          <p className="display tabular -mt-1 text-[length:var(--display-2)] leading-none text-ink">
            {formatPrice(account.price)}
          </p>

          {/* A divided metric row rather than four label-and-value pairs. The
              numbers lead and the words follow, because the number is what is
              being compared — set the other way round it reads as a form. */}
          <dl className="grid grid-cols-3 border-y border-[var(--border)]">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={cn(
                  "flex flex-col gap-0.5 py-3",
                  index > 0 && "border-l border-[var(--border)] pl-4",
                )}
              >
                <dd className="tabular text-[length:var(--text-lg)] font-semibold leading-none text-ink">
                  {metric.value}
                </dd>
                <dt className="text-[length:var(--text-xs)] text-ink-3">
                  {metric.label}
                </dt>
              </div>
            ))}
          </dl>

          {/* The action, at the size of an action. It was a small link floating
              to the right of a 42px price, which read as a footnote rather than
              as the way into the listing.

              A span, not a button: the whole card is already one link, and a
              button inside an anchor is invalid and unreachable by keyboard. */}
          <span
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius)]",
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
