"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { imagePublicUrl } from "@/lib/utils/imagePublicUrl";
import type { AccountImage } from "@/types/accountImage";

/**
 * The most slides the touch readout will draw as dots before it switches to a
 * figure. See the readout itself for why the line is here.
 */
const DOTS_MAX = 6;

/** A chevron at the site's stroke weight — see `specIcons` for the same hand. */
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
      className="size-4"
    >
      <path d={direction === "prev" ? "M12.2 4.6 6.8 10l5.4 5.4" : "M7.8 4.6 13.2 10l-5.4 5.4"} />
    </svg>
  );
}

/**
 * The screenshots on a card, browsable without leaving the page.
 *
 * ## Why a scroll track and not an index of `<Image>` swaps
 *
 * The frame is a scroll-snap track, so a phone gets the carousel for free:
 * native horizontal swipe, native momentum, native rubber-banding at the ends.
 * The alternative — one image swapped by state, plus touch handlers to fake a
 * drag — reimplements all of that badly, and it is the part of a carousel a
 * thumb notices most. The arrows are then just `scrollTo` calls, and the
 * position readout falls out of `scrollLeft` rather than being a second source
 * of truth that can disagree with what is on screen.
 *
 * ## The controls are split by input, not by breakpoint
 *
 * Arrows on `hover: hover`, a position readout on everything else. A pointer
 * that can hover gets buttons that stay out of the artwork until the pointer
 * is over it; a thumb, which cannot hover and does not need a button because
 * it can swipe, gets the readout instead and nothing to press. Keyed off the
 * pointer rather than the viewport width, because a small laptop window is
 * still a mouse and a large tablet is still a thumb.
 *
 * ## Each slide is a link
 *
 * The screenshot is the thing a buyer taps, so it has to go somewhere, and a
 * click target laid over the frame would swallow the swipe before the track
 * ever sees it. Making the slides themselves the links keeps both: a drag
 * scrolls and never fires a click, a tap navigates. They are out of the tab
 * order — the card's own link is the keyboard route in, and eight screenshots
 * on twelve cards would otherwise be a hundred tab stops before the pagination.
 */
export function ScreenshotCarousel({
  images,
  href,
  label,
  sizes,
  priority = false,
  dimmed = false,
  children,
}: {
  /** Already ordered — see `orderedImages`. */
  images: AccountImage[];
  /** The listing this card is for. Every slide links to it. */
  href: string;
  /** What to call the listing in labels — its reference. */
  label: string;
  sizes: string;
  /** Set on the first few cards so the LCP image is not lazy-loaded. */
  priority?: boolean;
  /** Sold and reserved listings are dimmed until the card is hovered. */
  dimmed?: boolean;
  /** Overlays that sit on the artwork: the scrim, the nameplate, a status. */
  children?: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  /* One slide is exactly one frame wide, so the index is the scroll offset
     divided by the frame. Rounded, not floored: mid-swipe the track sits
     between two slides and the nearer one is the honest answer. */
  function syncIndex() {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function go(to: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.min(Math.max(to, 0), count - 1);
    el.scrollTo({
      left: el.clientWidth * next,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    setIndex(next);
  }

  if (count === 0) {
    return (
      <div className="relative flex aspect-[16/10] items-center justify-center bg-surface-3 text-[length:var(--text-sm)] text-ink-3">
        No screenshot yet
        {children}
      </div>
    );
  }

  return (
    <div className="group/frame relative aspect-[16/10] overflow-hidden bg-surface-3">
      {/* Chrome makes a scroller with no focusable children a tab stop of its
          own, so that a keyboard can scroll it with the arrow keys. That is
          worth keeping — it is the only way through the strip without a mouse,
          now that the slides are out of the tab order — but an unnamed stop on
          a bare `div` tells a screen reader nothing, hence the role and the
          label. Reaching it lights the arrows, so the stop is visible when it
          is landed on rather than a place focus silently disappears to. */}
      <div
        ref={track}
        onScroll={syncIndex}
        role={count > 1 ? "group" : undefined}
        aria-label={count > 1 ? `Screenshots of ${label}` : undefined}
        className={cn(
          "flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain",
          // No scrollbar under the artwork; the dots and arrows say where you
          // are. Firefox takes the standard property, WebKit needs the pseudo.
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          dimmed && "opacity-60 transition-opacity group-hover:opacity-100",
        )}
      >
        {images.map((image, i) => (
          <Link
            key={image.id}
            href={href}
            tabIndex={-1}
            aria-label={
              image.alt_text ?? `${label} — screenshot ${i + 1} of ${count}`
            }
            className="relative h-full w-full shrink-0 snap-center overflow-hidden"
          >
            <Image
              src={imagePublicUrl(image.storage_path)}
              // The link carries the name; the picture inside it would only
              // repeat that name a second time.
              alt=""
              fill
              sizes={sizes}
              priority={priority && i === 0}
              className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-safe:group-hover:scale-[1.03]"
            />
          </Link>
        ))}
      </div>

      {children}

      {count > 1 && (
        <>
          {/* The arrows. In the nameplate's material — the oxblood plate with
              the lit --accent as its border — so the two things sitting on the
              artwork belong to the same shop. On hover they take the lit fill
              outright, which is what --accent means everywhere else on the
              site: this is the interactive one.

              Hidden until the pointer is over the card, and again at each end
              of the strip: an arrow that cannot go anywhere is a control that
              lies. Focus brings them back, or a keyboard user who tabbed here
              from the card would be pressing an invisible button. */}
          {(["prev", "next"] as const).map((direction) => {
            const spent =
              direction === "prev" ? index <= 0 : index >= count - 1;
            return (
              <button
                key={direction}
                type="button"
                onClick={() => go(direction === "prev" ? index - 1 : index + 1)}
                aria-label={`${direction === "prev" ? "Previous" : "Next"} screenshot of ${label}`}
                aria-hidden={spent}
                tabIndex={spent ? -1 : undefined}
                className={cn(
                  "absolute top-1/2 z-20 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full",
                  // 32px reads right on the artwork and 44px is what a pointer
                  // needs, so the target grows outward from the centre without
                  // the circle changing size. Not the `.hit-target` class that
                  // does this elsewhere: it sets `position: relative`, and
                  // being unlayered it would win over this button's `absolute`
                  // and drop both arrows into the flow.
                  "after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
                  "border border-accent/45 bg-accent-fill/85 text-on-accent-fill backdrop-blur-sm",
                  "shadow-[0_1px_8px_oklch(0_0_0/0.45)]",
                  "transition-[opacity,background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                  "hover:bg-accent hover:text-on-accent",
                  "[@media(hover:hover)]:flex",
                  direction === "prev" ? "left-2.5" : "right-2.5",
                  spent
                    ? "pointer-events-none opacity-0"
                    : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within/frame:opacity-100",
                )}
              >
                <Chevron direction={direction} />
              </button>
            );
          })}

          {/* Where you are, for the input that has no arrows. Bottom right
              because the shelf tile hangs its price tag off the bottom left of
              the same frame.

              A readout, not a control. Dots this size cannot honestly be
              tapped — six pixels, set six pixels apart, is under a seventh of
              the 44px a thumb needs, and spacing them out enough to hit would
              put a row of buttons across the artwork to do a job the swipe
              already does better. Marked `aria-hidden` because the position it
              reports is already in every slide's label ("screenshot 2 of 4").

              Dots only while they are still countable. A row of them costs
              12px a slide, so a listing with two dozen screenshots — which is
              an ordinary listing here, the seller shoots the whole collection
              — draws a bar the width of the artwork and straight through the
              price tag. Even given the room it would not read: past about six,
              nobody counts a row of dots to find out they are on the fourth of
              twenty-three, they just see a stripe. So the long strips get the
              figure instead, in the lightbox's chip, which is the same readout
              this carousel's own full-screen view already shows.

              Six is where the swap happens: a phone card can hold more than
              that, but the dots stop being a position and start being
              decoration well before they stop fitting. */}
          {count <= DOTS_MAX ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 rounded-full bg-[oklch(0_0_0/0.45)] px-2 py-1.5 backdrop-blur-sm [@media(hover:hover)]:hidden"
            >
              {images.map((image, i) => (
                <span
                  key={image.id}
                  className={cn(
                    "size-1.5 rounded-full transition-colors duration-[var(--dur-fast)]",
                    i === index ? "bg-[oklch(1_0_0)]" : "bg-[oklch(1_0_0/0.4)]",
                  )}
                />
              ))}
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="tabular pointer-events-none absolute bottom-2.5 right-2.5 z-20 rounded-full bg-[oklch(0_0_0/0.45)] px-2 py-1 text-[length:var(--text-xs)] font-medium leading-[1.4] text-[oklch(1_0_0)] backdrop-blur-sm [@media(hover:hover)]:hidden"
            >
              {index + 1}
              <span className="opacity-55">{" / "}</span>
              {count}
            </div>
          )}
        </>
      )}
    </div>
  );
}
