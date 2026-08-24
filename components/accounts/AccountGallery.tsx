"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { imagePublicUrl } from "@/lib/utils/imagePublicUrl";
import type { AccountImage } from "@/types/accountImage";

/**
 * The screenshot gallery — the part of the page that actually sells the
 * account.
 *
 * A large frame plus a thumbnail strip, rather than a swipe carousel. Buyers
 * are comparing evidence (rank screen, skin list, collection screen), so being
 * able to jump straight to the one they want beats swiping through in order.
 *
 * The main frame keeps a fixed aspect ratio and letterboxes: phone screenshots
 * arrive in several shapes, and cropping them to fit would hide exactly the
 * numbers a buyer is checking.
 */
export function AccountGallery({
  images,
  label,
}: {
  images: AccountImage[];
  /** What to call this listing in alt text — its reference. */
  label: string;
}) {
  const ordered = [...images].sort((a, b) => {
    // Cover first, then gallery order.
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.display_order - b.display_order;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const active = ordered[activeIndex];

  if (ordered.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface-2 text-ink-3">
        No screenshots for this account yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface-3">
        <Image
          key={active.id}
          src={imagePublicUrl(active.storage_path)}
          alt={active.alt_text ?? `${label} — screenshot ${activeIndex + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority={activeIndex === 0}
          className="object-contain motion-safe:animate-[fade-in_var(--dur)_var(--ease-out)]"
        />
      </div>

      {ordered.length > 1 && (
        <>
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {ordered.map((image, index) => {
              const current = index === activeIndex;
              return (
                <li key={image.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "relative block size-16 overflow-hidden rounded-[var(--radius)] border-2 sm:size-20",
                      "transition-[border-color,opacity] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                      current
                        ? "border-accent"
                        : "border-transparent opacity-65 hover:opacity-100",
                    )}
                  >
                    <span className="sr-only">
                      Show screenshot {index + 1} of {ordered.length}
                    </span>
                    <Image
                      src={imagePublicUrl(image.storage_path)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <p aria-live="polite" className="sr-only">
            Screenshot {activeIndex + 1} of {ordered.length}
          </p>
        </>
      )}
    </div>
  );
}
