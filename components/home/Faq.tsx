import { FAQ } from "./faqContent";

/**
 * Built on `<details>` rather than a hand-rolled accordion.
 *
 * The platform gives keyboard operation, the open/closed state, and — the part
 * that matters here — in-page find. A buyer pressing Ctrl+F for "refund" or
 * "banned" gets taken to the answer inside a closed `<details>` in every modern
 * browser. A div-based accordion hides that text from search entirely, which is
 * the opposite of what an FAQ is for.
 *
 * Two columns from `md` up, as CSS columns: the questions are wildly different
 * lengths, and a grid would pad the short ones to match the tall ones.
 */
export function Faq() {
  return (
    <div className="md:columns-2 md:gap-10">
      {FAQ.map((item) => (
        <details
          key={item.question}
          className="group mb-3 break-inside-avoid rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface open:bg-surface-3"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-3.5 text-[length:var(--text-md)] font-medium text-ink [&::-webkit-details-marker]:hidden">
            {item.question}

            {/* A plus that becomes a minus. Rotating a chevron says "more
                below"; a plus/minus says "this opens and closes", which is what
                the control actually does. */}
            <span
              aria-hidden="true"
              className="relative mt-1.5 size-3.5 shrink-0 text-accent-ink"
            >
              <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 rounded bg-current" />
              <span className="absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 rounded bg-current transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-open:rotate-90 group-open:scale-y-0" />
            </span>
          </summary>

          <p className="max-w-[62ch] px-4 pb-4 text-[length:var(--text-base)] leading-relaxed text-ink-2">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
