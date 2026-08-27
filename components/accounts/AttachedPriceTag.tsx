/**
 * The price, on a plate in the gallery frame's top-right corner.
 *
 * ## It used to straddle the edge, and that was the problem
 *
 * The plate hung half over the frame and half over the page above it, pinned
 * with `-translate-y-1/2`. The idea was sound — the catalogue card does exactly
 * that over its own image, and half-on/half-off is what makes a thing read as
 * lying *on* a surface rather than floating in front of it.
 *
 * It only works when there are two surfaces. On the card the overhang lands on
 * the card body, which is a lit panel; here it landed in the breadcrumb's
 * bottom margin, which is the page — black, empty, and not a surface at all.
 * So the top half of the plate was suspended in a void and the bottom half was
 * on the artwork, and the eye reads that as pasted on, which is the one thing
 * the straddle was supposed to prevent.
 *
 * Inside the frame there is no void to hang into. The plate is on the artwork
 * the whole way across, and the artwork is a real surface.
 *
 * ## Why the top-right specifically
 *
 * It is the corner diagonally opposite the reference chip, so the two facts
 * that identify a listing — which account, what it costs — bracket the picture
 * rather than stacking down one side. It is also the same corner the catalogue
 * card puts its status badge in, at the same `top-3 right-3` inset, so a buyer
 * who came from the shelf finds the top of the picture laid out the way they
 * left it.
 *
 * The frame draws a scrim under both corners (see `AccountGallery`) — a
 * screenshot is somebody else's artwork and the top of it can be any colour at
 * all, so neither plate is trusted to land on something dark.
 *
 * ## Size
 *
 * It ran to `--text-2xl` at `lg`, which on a 1200px frame was a 300px slab
 * across the top of the thing being sold. Two steps rather than three, topping
 * out at `--text-xl`: still the loudest object on the page by some distance —
 * it is the only lit oxblood on the artwork — without competing with the
 * screenshot for the space.
 *
 * ## Mechanics
 *
 * A sibling of the frame rather than a child, positioned against the bare
 * wrapper the gallery puts around the two of them. Nothing crosses an edge any
 * more so the frame's `overflow-hidden` would no longer clip it, but the slot
 * is the gallery's public seam and moving the plate inside would mean the
 * gallery deciding where it goes.
 *
 * The shadow is a `drop-shadow` filter on the wrapper rather than `box-shadow`
 * on the plate, because a `box-shadow` would be cut away by the plate's own
 * `clip-path`; the filter traces the rendered silhouette, chamfers included.
 * Two of them: a tight black one to seat the plate on the artwork, and a wide
 * oxblood one, because a black halo on a black-ish screenshot casts onto
 * nothing. Written as a single `filter` because two `drop-shadow-[…]` utilities
 * would set the same property and the second would simply win.
 *
 * `pointer-events-none`, because the whole frame is the zoom button and the
 * plate would otherwise be a dead patch in the corner of the one control the
 * gallery has.
 */
export function AttachedPriceTag({ price }: { price: string }) {
  return (
    <div
      className={[
        "pointer-events-none absolute right-3 top-3 z-20",
        "[filter:drop-shadow(0_1px_2px_oklch(0_0_0/0.55))_drop-shadow(0_4px_14px_oklch(0.3_0.11_22/0.5))]",
      ].join(" ")}
    >
      <p className="price-tag display tabular bg-accent-fill text-[length:var(--text-lg)] leading-none text-on-accent-fill sm:text-[length:var(--text-xl)]">
        {price}
      </p>
    </div>
  );
}
