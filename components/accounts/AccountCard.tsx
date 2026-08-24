import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/StatusBadge";
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
  const cover = coverImage(account);
  const isClosed = account.status !== "available";

  return (
    <Link
      href={`/accounts/${account.account_reference}`}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface",
        "transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
        "hover:border-[var(--border-strong)] motion-safe:hover:-translate-y-0.5",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden bg-surface-3",
          isClosed && "opacity-60 transition-opacity group-hover:opacity-100",
        )}
      >
        {cover ? (
          <Image
            src={imagePublicUrl(cover.storage_path)}
            alt={cover.alt_text ?? `Account ${account.account_reference} screenshot`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[length:var(--text-sm)] text-ink-3">
            No screenshot yet
          </div>
        )}

        {isClosed && (
          <div className="absolute left-3 top-3">
            <StatusBadge status={account.status} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
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

      </div>
    </Link>
  );
}
