"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { imagePublicUrl } from "@/lib/utils/imagePublicUrl";
import type { AccountImage } from "@/types/accountImage";

/**
 * A screenshot at full size, over everything else.
 *
 * ## Why the native `<dialog>`
 *
 * Focus trapping, the top layer, Escape-to-close and an inert background are
 * all things the platform already does correctly and that hand-written focus
 * management gets subtly wrong. `ConfirmDialog` made the same call; this is
 * the same element wearing a different shape. The top layer matters more here
 * than it does there — the viewer has to sit above a sticky header and above
 * every `z-index` inside `<main>`, and no stacking context can trap it.
 *
 * ## Why a scroll-snap track again
 *
 * The same reasoning as `ScreenshotCarousel`: a phone gets swipe, momentum and
 * rubber-banding from the browser rather than from touch handlers pretending
 * to be a browser. The arrows are `scrollTo` calls and the counter reads out
 * of `scrollLeft`, so what the controls claim and what is on screen cannot
 * disagree.
 *
 * The slides are mounted only while the viewer is open. Left in the DOM they
 * would be a second full-resolution copy of every screenshot, fetched on page
 * load at a `sizes` the gallery never asked for, for a control most visitors
 * never open.
 *
 * ## Tapping the picture closes it
 *
 * There is no zoom, so a tap on the artwork has nothing else to mean, and
 * "tap the big picture to put it away" is the gesture people already try. The
 * `<img>` is `pointer-events-none` so the tap lands on the slide underneath —
 * which also keeps the swipe intact, since the scroller, not the image, is
 * what a drag has to reach. A drag scrolls and never fires a click, so the two
 * do not collide.
 */
export function Lightbox({
  images,
  label,
  /** Which screenshot to open on; `null` keeps the viewer closed. */
  openAt,
  onClose,
  /** Lets the gallery underneath follow along, so closing lands on the same shot. */
  onIndexChange,
}: {
  /** Already ordered — see `orderedImages`. */
  images: AccountImage[];
  /** What to call this listing in labels — its reference. */
  label: string;
  openAt: number | null;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(openAt ?? 0);

  const open = openAt !== null;
  const count = images.length;

  /* One slide is exactly one viewport wide, so the index is the scroll offset
     divided by the frame. Rounded, not floored: mid-swipe the track sits
     between two slides and the nearer one is the honest answer. */
  const syncIndex = useCallback(() => {
    const el = track.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(next);
    onIndexChange?.(next);
  }, [onIndexChange]);

  const go = useCallback((to: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({
      left: el.clientWidth * to,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);

  /* Opening is two steps that cannot be collapsed: the element has to be in
     the top layer before the track has a width to scroll by, so the jump to
     the requested slide happens after `showModal`, without smoothing — the
     viewer should open *on* the screenshot that was clicked rather than
     opening on the first one and gliding to it. */
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
      setIndex(openAt);
      const strip = track.current;
      if (strip) strip.scrollLeft = strip.clientWidth * openAt;
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, openAt]);

  /* Chrome and Safari stop the page behind a modal dialog from scrolling;
     Firefox does not, and a viewer you can scroll the shop out from under is
     disorienting on a trackpad. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-label={`${label} — screenshots`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onKeyDown={(event) => {
        if (count < 2) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(Math.min(index + 1, count - 1));
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(Math.max(index - 1, 0));
        }
      }}
      className={cn(
        // A `<dialog>` arrives with a border, padding, a white ground and an
        // `auto` margin that centres a *box*. All four have to go before it
        // can be a full-bleed viewer rather than a panel.
        "m-0 h-[100dvh] max-h-[100dvh] w-[100dvw] max-w-[100dvw] border-0 bg-transparent p-0",
        "text-ink outline-none",
        "backdrop:bg-[oklch(0_0_0/0.9)] backdrop:backdrop-blur-sm",
        "motion-safe:animate-[fade-in_var(--dur)_var(--ease-out)]",
      )}
    >
      {open && (
        <div className="relative flex h-full w-full flex-col">
          <div
            ref={track}
            onScroll={syncIndex}
            role={count > 1 ? "group" : undefined}
            aria-label={count > 1 ? `Screenshots of ${label}` : undefined}
            className={cn(
              "flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-contain",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {images.map((image, i) => (
              <div
                key={image.id}
                onClick={onClose}
                className="relative h-full w-full shrink-0 snap-center cursor-zoom-out"
              >
                <Image
                  src={imagePublicUrl(image.storage_path)}
                  alt={
                    image.alt_text ??
                    `${label} — screenshot ${i + 1} of ${count}`
                  }
                  fill
                  sizes="100vw"
                  // The one on screen when the viewer opens is the whole point
                  // of opening it; the rest can wait until they are swiped to.
                  loading={i === openAt ? "eager" : "lazy"}
                  // Padding on a `fill` image shrinks its content box, so
                  // `object-contain` fits inside the inset rather than running
                  // under the controls at the edges.
                  className="pointer-events-none object-contain p-3 pb-20 pt-14 sm:p-12 sm:pb-24"
                />
              </div>
            ))}
          </div>

          {/* Where you are. Top left, opposite the close button, so the two
              things that are always on screen bracket the artwork instead of
              stacking in one corner. */}
          {count > 1 && (
            <p
              aria-live="polite"
              className="tabular pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-[oklch(0_0_0/0.55)] px-3 py-1.5 text-[length:var(--text-sm)] font-medium text-[oklch(1_0_0)] backdrop-blur-sm sm:left-5 sm:top-5"
            >
              {index + 1}
              <span className="sr-only"> of </span>
              <span aria-hidden="true" className="opacity-55">
                {" / "}
              </span>
              {count}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close the screenshot viewer"
            className={cn(
              "absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full sm:right-5 sm:top-5",
              "border border-[oklch(1_0_0/0.16)] bg-[oklch(0_0_0/0.55)] text-[oklch(1_0_0)] backdrop-blur-sm",
              "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
              "hover:bg-accent hover:text-on-accent",
            )}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              aria-hidden="true"
              className="size-4"
            >
              <path d="m5.5 5.5 9 9m0-9-9 9" />
            </svg>
          </button>

          {count > 1 && (
            <>
              {/* Hidden at each end rather than dimmed: an arrow that cannot
                  go anywhere is a control that lies. Same rule as the card
                  carousel, and the counter above still says where you are. */}
              {(["prev", "next"] as const).map((direction) => {
                const spent =
                  direction === "prev" ? index <= 0 : index >= count - 1;
                return (
                  <button
                    key={direction}
                    type="button"
                    onClick={() =>
                      go(direction === "prev" ? index - 1 : index + 1)
                    }
                    aria-label={`${direction === "prev" ? "Previous" : "Next"} screenshot`}
                    aria-hidden={spent}
                    tabIndex={spent ? -1 : undefined}
                    className={cn(
                      "absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full",
                      "border border-accent/40 bg-accent-fill/85 text-on-accent-fill backdrop-blur-sm",
                      "transition-[opacity,background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                      "hover:bg-accent hover:text-on-accent",
                      direction === "prev" ? "left-2 sm:left-5" : "right-2 sm:right-5",
                      spent && "pointer-events-none opacity-0",
                    )}
                  >
                    <Chevron direction={direction} />
                  </button>
                );
              })}

              {/* The strip, so a buyer can jump straight back to the rank
                  screen rather than swiping past the skins to reach it. */}
              <ul className="pointer-events-auto absolute inset-x-0 bottom-3 z-10 mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] gap-1.5 overflow-x-auto rounded-full bg-[oklch(0_0_0/0.55)] p-1.5 backdrop-blur-sm [scrollbar-width:none] sm:bottom-5 [&::-webkit-scrollbar]:hidden">
                {images.map((image, i) => (
                  <li key={image.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={i === index ? "true" : undefined}
                      className={cn(
                        "relative block h-10 w-14 overflow-hidden rounded-[var(--radius-sm)]",
                        "transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                        i === index
                          ? "opacity-100 outline outline-2 outline-offset-[-2px] outline-accent"
                          : "opacity-50 hover:opacity-85",
                      )}
                    >
                      <span className="sr-only">
                        Show screenshot {i + 1} of {count}
                      </span>
                      <Image
                        src={imagePublicUrl(image.storage_path)}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}

/** A chevron at the site's stroke weight — the same hand as `specIcons`. */
function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[18px]"
    >
      <path
        d={direction === "prev" ? "M12.2 4.6 6.8 10l5.4 5.4" : "M7.8 4.6 13.2 10l-5.4 5.4"}
      />
    </svg>
  );
}
