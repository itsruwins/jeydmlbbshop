import { PaymentMark, PaymentSprite } from "@/components/shared/PaymentGlyph";
import { PAYMENTS } from "@/lib/constants/payments";
import { cn } from "@/lib/utils/cn";

/**
 * The "we accept" marks, crawling.
 *
 * Two shapes of the same idea, because the two places that ask the question
 * are shaped differently — not because two designs were wanted.
 *
 * `card` is the contact panel on a listing: a caption with the strip beneath
 * it, in a 27rem rail. That rail is why the marks move at all. Eight wordmarks
 * will not fit across it, and stacking them would turn an aside into a block
 * with more weight than the button above it.
 *
 * `band` is the landing page: one full-width line between the shelf and the
 * process, caption pinned at the left with the marks travelling past it. It
 * sits directly above a heading that reads "Nothing is paid until step three",
 * which is the sentence this row exists to set up.
 *
 * ## Why the loop needs more copies than you would think
 *
 * The track is translated by exactly -50%, so the second half must land where
 * the first began. That only looks seamless if **one half is at least as wide
 * as the viewport** — otherwise the tail of the first half clears the right
 * edge before the second half arrives, and a gap crawls through.
 *
 * Eight chips come to roughly 570px. In the rail that comfortably exceeds the
 * ~400px on show, so one set per half is enough. Across the full-width band
 * there is ~1000px on show, so each half needs two sets. Hence `setsPerHalf`,
 * rather than a number picked to look right on one screen.
 *
 * Duplication is cheap here: the artwork lives once in `PaymentSprite` and
 * every mark is a `<use>` of it, so a copy costs a few bytes, not a logo.
 *
 * ## When it does not move
 *
 * Under `prefers-reduced-motion` nothing animates, so every set after the
 * first would be a visible duplicate. All of them are hidden and the viewport
 * is handed back to the reader to scroll instead — which is why the still
 * state has to be a usable row rather than a truncated one.
 *
 * ## What a screen reader gets
 *
 * A moving list of unlabelled images is worse than nothing, so the strip is
 * `aria-hidden` and the same information is offered once, as a sentence, on
 * the caption that is already there.
 */
export function PaymentMarks({
  variant = "card",
  className,
}: {
  variant?: "card" | "band";
  className?: string;
}) {
  const names = PAYMENTS.map((p) => p.name);
  const spoken =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
      : names[0];

  const band = variant === "band";

  // See the note above — this is set by how much of the strip is on show, not
  // by taste.
  const setsPerHalf = band ? 2 : 1;
  const sets = Array.from({ length: setsPerHalf * 2 }, (_, i) => i);

  const caption = (
    <p
      className={cn(
        "text-[length:var(--text-sm)] text-ink-3",
        band && "shrink-0",
      )}
    >
      We accept
      {/* The names, said once, where the caption already is. Reads as
          "We accept GCash, Maya … and PayPal" and costs nothing visually. */}
      <span className="sr-only">{` ${spoken}`}</span>
    </p>
  );

  // The fade has to be painted in the colour actually behind the strip, and
  // the two variants sit on different grounds.
  const fade = band ? "var(--bg)" : "var(--surface)";

  const strip = (
    /* The viewport clips; the track moves. They cannot be one element — the
       fades are positioned against the clip, and a transform on the clipping
       box would drag them along with the marks. */
    <div
      className={cn("mop-viewport relative", band && "min-w-0 flex-1")}
      style={band ? { ["--mop-duration" as string]: "50s" } : undefined}
    >
      {/* Marks travel leftward, so they enter at the right edge and leave at
          the left. Both edges need softening, the left one most of all in the
          band, where a hard cut would happen inches from the caption. */}
      <div
        aria-hidden="true"
        className="mop-fade pointer-events-none absolute inset-y-0 left-0 z-10 w-10"
        style={{
          backgroundImage: `linear-gradient(to right, ${fade}, ${fade} 25%, transparent)`,
        }}
      />
      <div
        aria-hidden="true"
        className="mop-fade pointer-events-none absolute inset-y-0 right-0 z-10 w-10"
        style={{
          backgroundImage: `linear-gradient(to left, ${fade}, ${fade} 25%, transparent)`,
        }}
      />

      <ul aria-hidden="true" className="mop-track flex w-max items-center">
        {sets.map((set) => (
          <li key={set} data-set={set} className="contents">
            {PAYMENTS.map((payment) => (
              <span
                key={`${set}-${payment.id}`}
                title={payment.name}
                className={cn(
                  // The knockout colour has to match what is behind the mark,
                  // since the few knocked-out shapes are painted with it
                  // rather than cut out of the artwork.
                  "[--mop-knockout:var(--surface-2)]",
                  "grid shrink-0 place-items-center rounded-[var(--radius-sm)]",
                  "border border-[var(--border)] bg-surface-2 text-ink-2",
                  // The rail is tight and the marks are an aside there. Across
                  // the full width of the page the same 13px mark reads as a
                  // row of specks, so the band gets its own size.
                  band ? "mr-3 h-9 px-3" : "mr-2 h-8 px-2.5",
                )}
              >
                <PaymentMark
                  id={payment.id}
                  className={band ? "h-4" : "h-[13px]"}
                />
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );

  if (band) {
    return (
      <div className={cn("mop flex items-center gap-4", className)}>
        {caption}
        {/* A hairline rather than more space. The caption is pinned and the
            marks are not, so the row needs a stated edge between the thing
            that holds still and the thing that moves. */}
        <span
          aria-hidden="true"
          className="hidden h-5 w-px shrink-0 bg-[var(--border)] sm:block"
        />
        <PaymentSprite />
        {strip}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mop flex flex-col gap-2 border-t border-[var(--border)] pt-3",
        className,
      )}
    >
      {caption}
      <PaymentSprite />
      {strip}
    </div>
  );
}
