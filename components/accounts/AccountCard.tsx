import Link from "next/link";

import { ScreenshotCarousel } from "@/components/accounts/ScreenshotCarousel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { orderedImages } from "@/lib/utils/accountImages";
import { cn } from "@/lib/utils/cn";
import { formatCount, formatPrice } from "@/lib/utils/format";
import type { AccountWithRelations } from "@/types/account";

/**
 * One listing in a grid.
 *
 * Buyers arrive from a social post and skim on a phone, so the card leads with
 * the screenshot and the price — the two things that decide whether they tap.
 * Rank and skin count follow, because those are what they compare between
 * listings.
 *
 * The 16:10 frame is not arbitrary. Mobile Legends is played in landscape, so
 * screenshots arrive at roughly 1.6:1 — a measured sample is 1600x1001. A 4:3
 * frame would crop about 17% off a shot like that, and the cropped strip is
 * exactly where the rank and collection numbers tend to sit. At 16:10 the crop
 * is essentially nil.
 *
 * Sold and reserved cards are dimmed rather than removed. They are the evidence
 * that sales actually happen here, which a new shop has little other way to
 * show. The dimming is lifted on hover so the details stay readable.
 *
 * The frame is browsable in place — the same carousel the homepage shelf uses,
 * so a buyer who learned it there does not meet a different card here. It is
 * why the card is an `article` with two links inside rather than one link
 * wrapped around everything: the arrows are buttons, and a button inside an
 * anchor is invalid and unreachable by keyboard.
 */
export function AccountCard({
  account,
  priority = false,
  highlightReference = false,
}: {
  account: AccountWithRelations;
  /** Set on the first few cards so the LCP image is not lazy-loaded. */
  priority?: boolean;
  /**
   * Promotes the reference from quiet metadata to the card's headline. Used on
   * the homepage featured wall — see the block that renders it.
   */
  highlightReference?: boolean;
}) {
  const images = orderedImages(account.images);
  const href = `/accounts/${account.account_reference}`;
  const isClosed = account.status !== "available";

  return (
    <article
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface",
        "transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
        "hover:border-[var(--border-strong)] motion-safe:hover:-translate-y-0.5",
      )}
    >
      <ScreenshotCarousel
        images={images}
        href={href}
        label={account.account_reference}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        dimmed={isClosed}
      >
        {isClosed && (
          <div className="pointer-events-none absolute left-3 top-3 z-20">
            <StatusBadge status={account.status} />
          </div>
        )}
      </ScreenshotCarousel>

      <Link href={href} className="flex flex-1 flex-col gap-2.5 p-3.5">
        {/* On the featured wall the reference is the listing's name, not a
            footnote: it is what a buyer quotes back when they message, and
            with no title on the card there is nothing else identifying it.
            So it leads, as a chip, on its own line.

            The amber accent is normally reserved for interactive state so it
            can never be confused with a status — but featured listings are
            always `available` (getFeaturedAccounts filters on it, and both
            mutations clear the flag when a listing stops being available), so
            no StatusBadge is ever on screen beside this. */}
        {highlightReference && (
          <p className="-mb-0.5">
            <span className="inline-flex max-w-full items-center truncate rounded-[var(--radius-sm)] border border-accent-border bg-accent-soft px-2 py-1 font-mono text-[length:var(--text-sm)] font-medium leading-none tracking-[0.01em] text-accent-ink">
              {account.account_reference}
            </span>
          </p>
        )}

        <div className="flex items-start justify-between gap-3">
          {/* The price never yields. References can run to 32 characters,
              which at this size would otherwise push the price out of the
              card entirely on a narrow column. */}
          <p className="tabular shrink-0 text-[length:var(--text-lg)] font-semibold leading-none tracking-[-0.01em] text-ink">
            {formatPrice(account.price)}
          </p>
          {!highlightReference && (
            <p className="min-w-0 truncate font-mono text-[length:var(--text-xs)] leading-none text-ink-3">
              {account.account_reference}
            </p>
          )}
        </div>

        {/* Metadata, ordered by what a buyer actually compares between two
            listings: skins first (the metric this market quotes), then
            collection level, then rank — which resets every season and so
            carries the least weight of the three.

            Collection level was previously 12px muted, the quietest thing on
            the card. For a collector account it is one of the main reasons to
            buy, so it now sits at the same size as the rest of the metadata. */}
        <dl className="mt-auto flex flex-col gap-1 pt-1 text-[length:var(--text-sm)]">
          {(account.skin_count !== null || account.rank) && (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {account.skin_count !== null && (
                <>
                  <dt className="sr-only">Skins</dt>
                  <dd className="tabular font-medium text-ink">
                    {formatCount(account.skin_count)} skins
                  </dd>
                </>
              )}
              {account.skin_count !== null && account.rank && (
                <span aria-hidden="true" className="text-ink-3">
                  ·
                </span>
              )}
              {account.rank && (
                <>
                  <dt className="sr-only">Rank</dt>
                  <dd className="text-ink-2">{account.rank.name}</dd>
                </>
              )}
            </div>
          )}

          {account.collection_level && (
            <div>
              <dt className="sr-only">Collection level</dt>
              <dd className="truncate text-ink-2">
                {account.collection_level.name}
              </dd>
            </div>
          )}
        </dl>

      </Link>
    </article>
  );
}
