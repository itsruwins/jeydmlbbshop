import Image from "next/image";
import Link from "next/link";

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
 * The listing that sits in the hero, rendered as the lot card of a dealer's
 * catalogue rather than as a bigger version of the grid card.
 *
 * A storefront's hero should contain stock, not a picture of the idea of
 * stock. This shop has a handful of listings at a time, so the strongest thing
 * it can put beside the headline is the actual account, priced, with its
 * specification legible without a click. That also solves the problem the
 * catalogue grid has at this inventory size: one card in a `1fr` grid stretches
 * to the full width of the page and stops reading as a product.
 *
 * The specification is a `<dl>`, not a paragraph, because it is the evidence.
 * Anything that cannot be filled in shows an em dash rather than disappearing —
 * a missing rank is information too, and hiding the row would quietly flatter
 * the listing.
 */
export function FeaturedListing({
  account,
}: {
  account: AccountWithRelations;
}) {
  const cover = coverImage(account);

  const specs = [
    { label: "Rank", value: account.rank?.name ?? "—" },
    { label: "Collection", value: account.collection_level?.name ?? "—" },
    { label: "Skins", value: formatCount(account.skin_count) },
    { label: "Heroes", value: formatCount(account.hero_count) },
  ];

  return (
    <Link
      href={`/accounts/${account.account_reference}`}
      className="group block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-surface shadow-[var(--shadow-pop)] transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:border-[var(--border-strong)] motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-3">
        {cover ? (
          <Image
            src={imagePublicUrl(cover.storage_path)}
            alt={cover.alt_text ?? `Account ${account.account_reference}`}
            fill
            // The hero image on the landing page: never lazy, and sized for the
            // half-width column it occupies from `lg` up.
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[length:var(--text-sm)] text-ink-3">
            No screenshot yet
          </div>
        )}

        {/* The reference is the thing a buyer quotes back when they message, so
            it is stamped on the image like a lot number. The scrim underneath
            is what keeps it legible over a screenshot whose brightness we do
            not control — MLBB profile shots run from near-black to near-white. */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-[oklch(0_0_0/0.55)] to-transparent p-3">
          <span className="rounded-[var(--radius-sm)] bg-[oklch(1_0_0/0.92)] px-2 py-1 font-mono text-[length:var(--text-sm)] font-medium leading-none tracking-[0.01em] text-[oklch(0.18_0_0)]">
            {account.account_reference}
          </span>
          <span className="rounded-full bg-[oklch(1_0_0/0.92)] px-2.5 py-1 text-[length:var(--text-xs)] font-medium leading-[1.4] text-[oklch(0.18_0_0)]">
            Available now
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <p className="display tabular text-[length:var(--display-2)] text-ink">
            {formatPrice(account.price)}
          </p>
          <span className="pb-1 text-[length:var(--text-sm)] font-medium text-accent-ink underline-offset-4 group-hover:underline">
            View listing →
          </span>
        </div>

        {/* Two columns, not four. At the width this card occupies, four columns
            give each value about 100px and "Mythical Glory" becomes
            "Mythical Gl…" — a specification that has to be truncated is not
            doing the job the specification is here to do. */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[var(--border)] pt-4">
          {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col gap-1">
              <dt className="text-[length:var(--text-xs)] text-ink-3">
                {spec.label}
              </dt>
              <dd className="tabular truncate text-[length:var(--text-sm)] font-medium text-ink">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Link>
  );
}
