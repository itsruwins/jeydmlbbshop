"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Lightbox } from "@/components/accounts/Lightbox";
import { orderedImages } from "@/lib/utils/accountImages";
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
 * The arrows are there for the other reading of the same strip — "show me the
 * next one" — and are the same control, in the same material, as the one on
 * the cards a buyer arrived from.
 *
 * ## The overlays are guests in the picture
 *
 * Arrows, counter and expand mark all sit on top of the thing being sold, so
 * on a pointer device they stay out of it until the cursor is over the frame.
 * That reveal is gated on `(hover: hover)` rather than on a breakpoint: a
 * touch screen has no cursor to arrive with, so hiding them there would hide
 * them for good. Focus reveals them too, or tabbing to an arrow would move
 * focus to something invisible.
 *
 * There is one thing per corner and nothing is stacked: the reference top
 * left, the price top right, the counter bottom left, the expand mark bottom
 * right. The expand mark is the one that moved — the price plate took the
 * top-right corner (see `AttachedPriceTag`) and two plates in one corner is a
 * pile. Bottom right is the corner it can afford to lose to: the whole frame
 * is already the zoom button, so the mark is a hint rather than the control,
 * and it is revealed on hover in either place.
 *
 * The two that are always visible — the reference and the price — get a scrim
 * under them rather than being trusted to the picture. A screenshot is
 * somebody else's artwork and the top of a Mobile Legends profile is as often
 * a white splash or a lit sky as it is a dark one, so the top band is darkened
 * on the way in. It is the same gradient the catalogue card draws under its
 * own two corner plates, at the same strength, which is the point: the top of
 * a picture is laid out one way on this site.
 *
 * ## The frame takes the shape of the picture in it
 *
 * It used to be a fixed 16:10 box with `object-contain` inside, which is the
 * safe choice and the wrong one here. Screenshots arrive in several shapes,
 * and anything squarer than 16:10 was letterboxed into two black bands — on a
 * black page they do not read as letterboxing, they read as the page being
 * broken. Cropping to fill instead would hide exactly the numbers a buyer is
 * checking, so the frame moves rather than the picture.
 *
 * The ratio comes from the image itself, via `naturalWidth / naturalHeight` on
 * load. Nothing has to be stored: the thumbnails are decoded first and are the
 * same pictures, so by the time a buyer can press anything every ratio in the
 * set is already known and switching shots does not wait on a fetch. Until one
 * is known the frame holds `DEFAULT_RATIO`, which is what a Mobile Legends
 * screenshot actually measures — so the common case never moves at all.
 *
 * The clamp is the guard against the pathological upload: one portrait
 * screenshot in a set should not turn the top of the page into a tower.
 *
 * ## Why the picture is `cover` inside a frame cut to its own shape
 *
 * `object-contain` in a frame that is already the right shape sounds like it
 * should touch all four edges, and it did not: there were hairline bands of
 * `bg-surface-3` down the sides. Two reasons, and they add up rather than
 * cancel.
 *
 * The measurement is off by a fraction of a percent. `naturalWidth` is the
 * width of the *variant Next served*, not of the upload, and each variant is
 * rounded to whole pixels — a 2400x1037 shot asked for at 96px comes back
 * 96x41, which is 2.342 rather than 2.315. That is under half a percent, and
 * half a percent of a 970px frame is five visible pixels.
 *
 * `aspect-ratio` then applies to the border box. The 1px border is inside it,
 * so the content box the picture actually lives in is 2px shorter and 2px
 * narrower than the shape that was requested, and is therefore never quite
 * that shape.
 *
 * Chasing either to zero is the wrong shape of fix — the residue is always
 * some sub-pixel number that a browser will round its own way. `cover` makes
 * the question moot: it fills the frame and pays for it by trimming whatever
 * the mismatch was, which is under a pixel of an edge nobody is reading.
 * `contain` is still there for the one case where the two shapes genuinely
 * differ — a shot outside the clamp, or one not measured yet — because there
 * `cover` would be cropping in earnest, over the numbers a buyer came to read.
 */

/** A measured Mobile Legends screenshot is ~1600x1001. */
const DEFAULT_RATIO = 1.6;
/** Between 4:5 and 12:5 the frame follows the picture; outside it, it stops. */
const MIN_RATIO = 0.8;
const MAX_RATIO = 2.4;

/**
 * The overlay reveal, in one place because three controls share it.
 *
 * Base state is *visible*: that is what a touch screen gets, and it has to be
 * the fallback rather than the exception, because `(hover: none)` devices have
 * no way to ask for a hidden control. Only where a cursor exists does the
 * control start at zero and wait to be hovered — or focused, so a keyboard tab
 * never lands on something the eye cannot find.
 */
const REVEAL_ON_HOVER = [
  "[@media(hover:hover)]:opacity-0",
  "[@media(hover:hover)]:group-hover/frame:opacity-100",
  "[@media(hover:hover)]:group-focus-within/frame:opacity-100",
].join(" ");

export function AccountGallery({
  images,
  label,
  priceTag,
}: {
  images: AccountImage[];
  /** What to call this listing in alt text — its reference. */
  label: string;
  /**
   * The price plate, in the frame's top-right corner.
   *
   * A slot rather than a `price` prop, for two reasons. This is a client
   * component and `formatPrice` carries an `Intl.NumberFormat` that would be
   * shipped to render one value that cannot change; and the gallery's stake in
   * the plate is only *where it sits* — its shape and size are the listing
   * page's business, and every other caller passes nothing.
   */
  priceTag?: ReactNode;
}) {
  const ordered = orderedImages(images);

  const [activeIndex, setActiveIndex] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  /* Which ratios came from the full-size file. Only those are trusted enough
     to cut the frame to and then fill it edge to edge. */
  const [measured, setMeasured] = useState<Record<string, true>>({});
  const [expandedAt, setExpandedAt] = useState<number | null>(null);
  const strip = useRef<HTMLUListElement>(null);

  const active = ordered[activeIndex];
  const count = ordered.length;

  /* Arrow keys and the viewer can both move the selection, and either can
     leave the active thumbnail off the end of a strip that scrolls. */
  useEffect(() => {
    const el = strip.current?.children[activeIndex];
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeIndex]);

  /**
   * `precise` marks the measurement taken from the large frame rather than
   * from a 96px thumbnail. Both describe the same picture, but the thumbnail's
   * height was rounded to a whole pixel at a size where one pixel is over two
   * percent, so it is only ever a stand-in: good enough to hold the frame's
   * shape before the big file lands, and given up the moment the real one
   * arrives. Without the rank the two race, and the thumbnail wins about as
   * often as not.
   */
  function remember(id: string, element: HTMLImageElement, precise: boolean) {
    const { naturalWidth, naturalHeight } = element;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = naturalWidth / naturalHeight;
    setRatios((current) => {
      if (current[id] === ratio) return current;
      if (!precise && current[id] !== undefined) return current;
      return { ...current, [id]: ratio };
    });
    if (precise)
      setMeasured((current) =>
        current[id] ? current : { ...current, [id]: true },
      );
  }

  function step(delta: number) {
    setActiveIndex((current) =>
      Math.min(Math.max(current + delta, 0), count - 1),
    );
  }

  if (count === 0) {
    /* The tag straddles the placeholder's corner exactly as it straddles a real
       frame's. A listing with no screenshots yet is still a priced listing, and
       dropping the tag here would make the missing artwork read as a missing
       price as well. */
    return (
      <div className="relative">
        <div className="flex aspect-[16/10] items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface-2 text-[length:var(--text-sm)] text-ink-3">
          No screenshots for this account yet
        </div>
        {priceTag}
      </div>
    );
  }

  const shotRatio = ratios[active.id] ?? DEFAULT_RATIO;
  const frameRatio = Math.min(Math.max(shotRatio, MIN_RATIO), MAX_RATIO);

  /* The frame is the shot's own shape only when the shot has been measured at
     full size *and* the clamp did not step in. That is the one case where
     filling the frame cannot crop anything a buyer wanted. */
  const frameFitsShot =
    measured[active.id] === true && frameRatio === shotRatio;

  return (
    <div className="flex flex-col gap-3">
      {/* A bare positioning context around the frame and its tag, and nothing
          else. The frame cannot be it: `overflow-hidden` is load-bearing there
          — the rounded corners and the `fill` image both depend on it — and a
          tag positioned inside it would be cut in half at the very edge it is
          supposed to cross. */}
      <div className="relative">
        <div
          onKeyDown={(event) => {
            if (count < 2) return;
            if (event.key === "ArrowRight") {
              event.preventDefault();
              step(1);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              step(-1);
            }
          }}
          style={{ aspectRatio: frameRatio }}
          className={cn(
            "group/frame relative overflow-hidden rounded-[var(--radius-lg)]",
            "border border-[var(--border)] bg-surface-3",
            // Browsers that decline to interpolate a ratio simply snap to the
            // new shape, which is the same end state a beat sooner.
            "transition-[aspect-ratio] duration-[var(--dur-slow)] ease-[var(--ease-out)]",
          )}
        >
          {/* The picture is the button. A buyer's instinct on a screenshot this
            size is to press it for a closer look, so pressing it has to do
            that rather than nothing — and `cursor-zoom-in` says so before the
            press, which is the only affordance a bare image can carry. */}
          <button
            type="button"
            onClick={() => setExpandedAt(activeIndex)}
            className="absolute inset-0 cursor-zoom-in"
          >
            <span className="sr-only">
              Expand screenshot {activeIndex + 1} of {count}
            </span>
            <Image
              key={active.id}
              src={imagePublicUrl(active.storage_path)}
              alt={
                active.alt_text ?? `${label} — screenshot ${activeIndex + 1}`
              }
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              // The listing's own LCP element. `priority` is deprecated as of
              // Next 16 — this is the same instruction, named for what it does.
              preload={activeIndex === 0}
              onLoad={(event) => remember(active.id, event.currentTarget, true)}
              className={cn(
                "motion-safe:animate-[fade-in_var(--dur)_var(--ease-out)]",
                frameFitsShot ? "object-cover" : "object-contain",
              )}
            />
          </button>

          {/* The ground the two permanent corner plates stand on. Taller than
            the card's (h-20 against h-16) because this frame is several times
            the size and a 4rem band across a 60vw picture is a smudge; the
            stop is the same, so the two read as the same treatment scaled.

            Above the picture and below everything that lands on it: `z-10`
            here, `z-20` on the two plates it exists for. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-[oklch(0_0_0/0.45)] to-transparent"
          />

          {/* The listing's identity, on the listing's own artwork.

            It is the page's `<h1>`, and it lives here rather than in the offer
            column because a reference is a *label for this picture* — a buyer
            screenshots the frame or shares the link and the code has to travel
            with the image, not sit in a rail that gets cropped out of both. It
            is also the one thing on the page that is true of every slide, so
            it holds still while the pictures change under it.

            Drawn in the same glass as the expand affordance opposite it: the
            two are a matched pair of overlays on the same surface, and giving
            the chip its own treatment would read as two unrelated things
            stuck on one image. Fixed white and fixed black rather than theme
            tokens, for the same reason that mark is — it sits on a screenshot,
            not on the page, and the artwork behind it is whatever it is in
            either theme.

            `pointer-events-none`, because the whole frame is the zoom button
            and a chip that swallowed the press in its corner would be a dead
            patch on the one control the gallery has. */}
          <h1
            className={cn(
              "pointer-events-none absolute left-3 top-3 z-20 rounded-full px-2.5 py-1",
              "border border-[oklch(1_0_0/0.14)] bg-[oklch(0_0_0/0.5)] backdrop-blur-sm",
              "font-mono text-[length:var(--text-sm)] font-semibold leading-none tracking-[-0.01em]",
              "text-[oklch(1_0_0)]",
            )}
          >
            {label}
          </h1>

          {/* The expand affordance, stated rather than implied. It is not a
            second button — the whole frame is already the control — so it is
            `pointer-events-none` and rides the frame's own hover state. */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute bottom-3 right-3 z-10 flex size-8 items-center justify-center rounded-full",
              "border border-[oklch(1_0_0/0.14)] bg-[oklch(0_0_0/0.5)] text-[oklch(1_0_0)] backdrop-blur-sm",
              "transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)]",
              "opacity-70",
              REVEAL_ON_HOVER,
            )}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M12.2 3.4h4.4v4.4M7.8 16.6H3.4v-4.4M16.6 3.4l-5 5M3.4 16.6l5-5" />
            </svg>
          </span>

          {count > 1 && (
            <>
              {/* The card carousel's arrows, in the same material: the oxblood
                plate with the lit --accent as its border, taking the lit fill
                outright on hover. Also with the same manners — they stay out
                of the artwork until the cursor arrives, because the screenshot
                is the thing being sold and a plate parked over it is in the
                way. At each end the arrow is gone rather than dimmed, and that
                case is written as the *alternative* to the reveal rather than
                layered on top of it: two rules both setting opacity would let
                a hover light up a control that cannot go anywhere. */}
              {(["prev", "next"] as const).map((direction) => {
                const spent =
                  direction === "prev"
                    ? activeIndex <= 0
                    : activeIndex >= count - 1;
                return (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => step(direction === "prev" ? -1 : 1)}
                    aria-label={`${direction === "prev" ? "Previous" : "Next"} screenshot of ${label}`}
                    aria-hidden={spent}
                    tabIndex={spent ? -1 : undefined}
                    className={cn(
                      "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full",
                      "border border-accent/45 bg-accent-fill/85 text-on-accent-fill backdrop-blur-sm",
                      "shadow-[0_1px_8px_oklch(0_0_0/0.45)]",
                      "transition-[opacity,background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                      "hover:bg-accent hover:text-on-accent",
                      direction === "prev" ? "left-3" : "right-3",
                      spent ? "pointer-events-none opacity-0" : REVEAL_ON_HOVER,
                    )}
                  >
                    <Chevron direction={direction} />
                  </button>
                );
              })}

              <p
                aria-hidden="true"
                className={cn(
                  "tabular pointer-events-none absolute bottom-3 left-3 z-10 rounded-full",
                  "bg-[oklch(0_0_0/0.5)] px-2.5 py-1 text-[length:var(--text-xs)] font-medium text-[oklch(1_0_0)] backdrop-blur-sm",
                  "transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                  REVEAL_ON_HOVER,
                )}
              >
                {activeIndex + 1} / {count}
              </p>
            </>
          )}
        </div>

        {priceTag}
      </div>

      {count > 1 && (
        <>
          <ul
            ref={strip}
            className={cn(
              "flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]",
              // The strip scrolls when a listing has more shots than fit, and
              // both things that move it — a click on a thumbnail, an arrow key
              // on the frame — end in `scrollIntoView`. Snapping gives that
              // somewhere to land, so a strip never comes to rest with a
              // half-thumbnail at the edge pretending to be the last one.
              "snap-x snap-mandatory scroll-pl-1 motion-safe:scroll-smooth",
            )}
          >
            {ordered.map((image, index) => {
              const current = index === activeIndex;
              return (
                <li key={image.id} className="shrink-0 snap-start">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "group/thumb relative block h-16 w-[5.5rem] overflow-hidden rounded-[var(--radius)]",
                      "sm:h-[4.5rem] sm:w-24 lg:h-[5.25rem] lg:w-28",
                      "transition-[box-shadow,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                      "motion-safe:hover:-translate-y-0.5",
                      // Outlines drawn inward rather than borders, so a
                      // thumbnail does not change size when it becomes the
                      // current one and shove the rest of the strip sideways.
                      //
                      // Every thumbnail carries one. Without it the inactive
                      // shots are bare crops floating on a black page — no
                      // edge, so no set — and the current one is the only
                      // thing in the row that looks like an object. The hairline
                      // is what makes them a filmstrip; the accent is what
                      // makes one of them the one you are looking at.
                      "outline outline-2 outline-offset-[-2px]",
                      current
                        ? "outline-accent shadow-[0_0_0_1px_oklch(0_0_0/0.6),0_4px_16px_oklch(0.3_0.11_22/0.45)]"
                        : "outline-[oklch(1_0_0/0.1)] hover:outline-[oklch(1_0_0/0.22)]",
                    )}
                  >
                    <span className="sr-only">
                      Show screenshot {index + 1} of {count}
                    </span>
                    <Image
                      src={imagePublicUrl(image.storage_path)}
                      alt=""
                      fill
                      sizes="112px"
                      // Cheap and early: these decode before anything is
                      // pressed, so the frame has an approximate shape for
                      // every shot in the set before any of them is asked for
                      // — see `remember` for why it is only approximate.
                      onLoad={(event) =>
                        remember(image.id, event.currentTarget, false)
                      }
                      className="object-cover"
                    />

                    {/* The dimming is a veil over the picture, not `opacity` on
                      the button.

                      They are not the same operation on a black page. Fading
                      the whole thumbnail mixes it toward the background, and
                      mixing a screenshot toward black takes its contrast with
                      it — the inactive shots went muddy and grey rather than
                      dark, which is how you lose the ability to tell a rank
                      screen from a skin list at a glance, which is the only
                      job the strip has. A black veil at 45% keeps the picture's
                      own contrast underneath and simply turns the lights down
                      on it. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 bg-[oklch(0_0_0)]",
                        "transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                        current
                          ? "opacity-0"
                          : "opacity-45 group-hover/thumb:opacity-20",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <p aria-live="polite" className="sr-only">
            Screenshot {activeIndex + 1} of {count}
          </p>
        </>
      )}

      <Lightbox
        images={ordered}
        label={label}
        openAt={expandedAt}
        onClose={() => setExpandedAt(null)}
        onIndexChange={setActiveIndex}
      />
    </div>
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
      className="size-[17px]"
    >
      <path
        d={
          direction === "prev"
            ? "M12.2 4.6 6.8 10l5.4 5.4"
            : "M7.8 4.6 13.2 10l-5.4 5.4"
        }
      />
    </svg>
  );
}
