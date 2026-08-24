import { SocialButtons } from "@/components/shared/SocialButtons";
import { getSocialLinks } from "@/functions/socialLinks/getSocialLinks";
import { SELL_MESSAGE } from "@/lib/utils/contactMessage";

/**
 * The seller's call to action.
 *
 * The page repeats this twice — once at the top for anyone who already knows
 * what they want, once at the bottom for anyone who read the whole thing. Both
 * render the same component, so there is no chance of the two drifting.
 */
export async function SellCTA({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  const links = await getSocialLinks();

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-ink">{heading}</h2>
        <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-2">
          {body}
        </p>
      </div>

      <SocialButtons
        links={links}
        message={SELL_MESSAGE}
        emptyNotice="Contact details are being set up. Please check back shortly."
      />
    </div>
  );
}
