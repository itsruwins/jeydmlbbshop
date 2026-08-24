import Image from "next/image";

import { SHOP } from "@/lib/constants/shop";
import { initialOf } from "@/lib/utils/avatarUrl";
import { cn } from "@/lib/utils/cn";

import type { Vouch } from "./vouches";

/**
 * A thumbs-up, drawn rather than imported.
 *
 * Facebook's own icon is their asset; this is the same gesture in the site's
 * stroke weight, which is the whole approach here — cite the format, do not
 * copy the artwork.
 */
function LikeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-[15px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 17V8.5l3.2-5.2a1.4 1.4 0 0 1 2.5 1.1L11 8h4.2a1.6 1.6 0 0 1 1.55 2l-1.3 5.4A2 2 0 0 1 13.5 17H6Z" />
      <path d="M6 8.5H4.4A1.4 1.4 0 0 0 3 9.9v5.7A1.4 1.4 0 0 0 4.4 17H6" />
    </svg>
  );
}

/**
 * One Facebook comment, rebuilt in this site's materials.
 *
 * The shape is Facebook's and deliberately so — round avatar at the left, name
 * and words together inside a rounded bubble, a quiet action row beneath. That
 * silhouette is recognisable from across a room, and recognising it is the
 * point: it says *where this came from* faster than any label could.
 *
 * Everything else is ours. Facebook's greys and blues are not used, because an
 * imported palette on a black-and-oxblood page reads as a screenshot someone
 * pasted in rather than as part of the page. The icon is drawn here rather than
 * copied. The result cites the format instead of impersonating the product.
 *
 * The like and reply row is inert and `aria-hidden`. It is silhouette, not
 * function: there is nothing here to like and nobody to reply to, so it is
 * rendered muted and never as a button — a control that looks pressable and is
 * not is a small broken promise repeated on every card. No reaction counts
 * appear anywhere, because inventing them on a page about trustworthiness is
 * the one detail that would actually be a lie.
 */
export function VouchCard({
  vouch,
  className,
}: {
  vouch: Vouch;
  className?: string;
}) {
  return (
    <figure className={cn("flex items-start gap-2.5", className)}>
      {vouch.avatar ? (
        <Image
          src={vouch.avatar}
          // Decorative: the name is right beside it in text, so announcing the
          // photo as well would just repeat them.
          alt=""
          width={40}
          height={40}
          // Served straight from `public/`, not through the image optimizer.
          //
          // The files are already cropped square and stored at 128px, which is
          // this 40px avatar on a 3x screen — there is nothing for the
          // optimizer to do but add a round trip. More to the point, its cache
          // survives `next build` and is keyed on the URL, so replacing an
          // avatar under the same filename left it serving the *old* picture
          // indefinitely. That is precisely the documented way to update one of
          // these, so the optimizer had to go.
          unoptimized
          className="mt-0.5 size-10 shrink-0 rounded-full border border-[var(--border)] object-cover"
        />
      ) : (
        // A name badge rather than a generic silhouette: a stand-in that still
        // belongs to this person, and one less stock asset on the page.
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-[var(--accent-border)] bg-accent-soft text-[length:var(--text-md)] font-semibold text-accent-ink"
        >
          {initialOf(vouch.name)}
        </span>
      )}

      <div className="flex min-w-0 flex-col gap-1">
        <div className="rounded-[1.15rem] bg-surface-3 px-3.5 py-2.5">
          <p className="text-[length:var(--text-sm)] font-semibold text-ink">
            {vouch.name}
          </p>
          <blockquote className="mt-0.5 text-[length:var(--text-md)] leading-relaxed text-ink">
            {vouch.quote}
          </blockquote>
        </div>

        <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 text-[length:var(--text-xs)] text-ink-3">
          <span aria-hidden="true" className="flex items-center gap-1">
            <LikeIcon />
          </span>
          <span aria-hidden="true" className="font-medium">
            Reply
          </span>

          {vouch.posted && <span>{vouch.posted}</span>}
        </figcaption>
      </div>
    </figure>
  );
}

/**
 * The rest of the feedback, below the fold.
 *
 * CSS columns rather than a grid: real comments are wildly different lengths,
 * and a grid would either crop them to a common height or pad the short ones
 * with empty space. `break-inside: avoid` stops one splitting across a column
 * break mid-sentence.
 *
 * Renders nothing when there is nothing to show — a heading over an empty wall
 * advertises the absence.
 */
export function VouchWall({ vouches }: { vouches: Vouch[] }) {
  if (vouches.length === 0) return null;

  return (
    <section className="border-t border-[var(--border)] bg-surface-2">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-3 sm:max-w-xl">
          <h2 className="display text-[length:var(--display-2)] text-ink">
            More from the people who bought
          </h2>
          <p className="text-[length:var(--text-md)] leading-relaxed text-ink-2">
            Comments left on our Facebook post, by buyers who already went
            through the handover.
          </p>
        </div>

        <ul className="mt-10 gap-x-8 space-y-8 sm:columns-2 lg:columns-3">
          {vouches.map((vouch) => (
            <li key={vouch.id} className="break-inside-avoid">
              <VouchCard vouch={vouch} />
            </li>
          ))}
        </ul>

        {SHOP.vouchPostUrl && (
          <p className="mt-10 text-[length:var(--text-sm)] text-ink-3">
            All of these are from{" "}
            <a
              href={SHOP.vouchPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-ink underline underline-offset-2 hover:no-underline"
            >
              our feedback post on Facebook
            </a>
            , posted with each person&apos;s permission.
          </p>
        )}
      </div>
    </section>
  );
}
