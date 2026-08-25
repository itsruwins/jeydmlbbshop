/**
 * The four marks used on a shelf tile.
 *
 * Drawn here rather than pulled from an icon set, for the same reason the
 * thumbs-up in the vouch cards is: they need to sit at this site's stroke
 * weight beside 13px text, and a general-purpose set drawn for 24px reads as
 * heavy and slightly foreign at this size.
 *
 * All decorative. The text beside each one carries the meaning — a screen
 * reader gets "Rank: Mythical Immortal" from a visually hidden label, not from
 * the picture.
 */
const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "size-[15px] shrink-0 text-ink-3",
};

/** Rank. */
export function CrownIcon() {
  return (
    <svg {...base}>
      <path d="M2.8 14.2 4 6.4l3.3 3.5L10 4.4l2.7 5.5L16 6.4l1.2 7.8Z" />
      <path d="M3.4 17h13.2" />
    </svg>
  );
}

/** Collection level. */
export function GemIcon() {
  return (
    <svg {...base}>
      <path d="M10 3.2 16.4 8 10 16.8 3.6 8Z" />
      <path d="M3.6 8h12.8" />
      <path d="M10 3.2 7.4 8l2.6 8.8L12.6 8Z" />
    </svg>
  );
}

/** Skins. A spark rather than a garment: these are cosmetics, not clothing. */
export function SparkIcon() {
  return (
    <svg {...base}>
      <path d="M10 2.8c.5 3.9 2.5 5.9 6.4 6.4-3.9.5-5.9 2.5-6.4 6.4-.5-3.9-2.5-5.9-6.4-6.4 3.9-.5 5.9-2.5 6.4-6.4Z" />
    </svg>
  );
}

/** Heroes owned. */
export function HeroIcon() {
  return (
    <svg {...base}>
      <circle cx="10" cy="7.1" r="2.9" />
      <path d="M4.5 16.6c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    </svg>
  );
}

/**
 * How many screenshots back the listing up.
 *
 * Only the hero panel uses it — the shelf tile dropped that metric — but it is
 * drawn here so the five marks stay one set at one stroke weight.
 */
export function FrameIcon() {
  return (
    <svg {...base}>
      <rect x="2.8" y="4.4" width="14.4" height="11.2" rx="2.2" />
      <path d="M2.9 12.4 6.9 8.8l3.6 3.2 2.2-1.9 4.4 3.8" />
      <circle cx="12.7" cy="8.1" r="1.1" />
    </svg>
  );
}
