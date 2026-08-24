import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";

import type { Vouch } from "./vouches";

/**
 * One piece of feedback.
 *
 * Exported on its own because the same quote has to appear in two places: two
 * of them sit in the hero, where the proof is the argument, and the rest fill
 * the wall further down. Rendering them through one component is what stops
 * the hero pair and the wall drifting into two different-looking quotes.
 *
 * The mark above the quote is set in the brand oxblood — it is the one piece
 * of pure decoration on the page, and it earns its place by making a block of
 * text read as *someone speaking* at a glance.
 */
export function VouchCard({
  vouch,
  className,
}: {
  vouch: Vouch;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface p-5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="display text-[length:var(--text-2xl)] leading-none text-accent-ink"
      >
        &ldquo;
      </span>

      <blockquote className="text-[length:var(--text-md)] leading-relaxed text-ink">
        {vouch.quote}
      </blockquote>

      <figcaption className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-[var(--border)] pt-3 text-[length:var(--text-sm)]">
        <span className="font-medium text-ink">{vouch.name}</span>
        <span aria-hidden="true" className="text-ink-3">
          ·
        </span>
        <time dateTime={vouch.date} className="text-ink-3">
          {formatDate(vouch.date)}
        </time>
        {vouch.bought && (
          <>
            <span aria-hidden="true" className="text-ink-3">
              ·
            </span>
            <span className="text-ink-3">{vouch.bought}</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * The rest of the feedback, below the fold.
 *
 * Laid out in CSS columns rather than a grid: real quotes are different
 * lengths, and a grid would either crop them to a common height or pad the
 * short ones with empty space. Columns let each quote be exactly as long as it
 * is, which is also what makes them read as quotes rather than as marketing
 * copy poured into six identical boxes. `break-inside: avoid` is what stops one
 * splitting across a column break mid-sentence.
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
            Left on our Facebook page, by buyers who already went through the
            handover.
          </p>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <p
            role="status"
            className="mt-6 rounded-[var(--radius)] border border-[var(--accent-border)] bg-accent-soft px-4 py-3 text-[length:var(--text-sm)] font-medium text-accent-ink"
          >
            Development only: this feedback is placeholder text. Replace it with
            real Facebook feedback in{" "}
            <code className="font-mono">components/home/vouches.ts</code>, or
            empty the array, before launching.
          </p>
        )}

        <ul className="mt-10 gap-5 space-y-5 sm:columns-2 lg:columns-3">
          {vouches.map((vouch) => (
            <li
              key={`${vouch.name}-${vouch.date}`}
              className="break-inside-avoid"
            >
              <VouchCard vouch={vouch} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
