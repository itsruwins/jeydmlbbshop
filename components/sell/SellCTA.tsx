import { FollowLinks } from "@/components/shared/FollowLinks";
import { SocialButtons } from "@/components/shared/SocialButtons";
import { getSocialLinks } from "@/functions/socialLinks/getSocialLinks";
import { SELL_MESSAGE } from "@/lib/utils/contactMessage";
import { contactLinks, followLinks } from "@/lib/utils/socialLinks";

/**
 * The seller's call to action.
 *
 * The page repeats this twice — once at the top for anyone who already knows
 * what they want, once at the bottom for anyone who read the whole thing. Both
 * render the same component, so there is no chance of the two drifting.
 *
 * The follow icons are shown only where the seller has read far enough to be
 * deciding — `showFollow` is off for the panel at the top of the page. Someone
 * weighing up whether to hand over an account is looking for evidence the shop
 * is real and active, and a feed is that evidence; the same icons above the
 * argument are just a distraction from it.
 */
export async function SellCTA({
  heading,
  body,
  showFollow = false,
}: {
  heading: string;
  body: string;
  showFollow?: boolean;
}) {
  const links = await getSocialLinks();
  const follow = showFollow ? followLinks(links) : [];

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-ink">{heading}</h2>
        <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-2">
          {body}
        </p>
      </div>

      <SocialButtons
        links={contactLinks(links)}
        message={SELL_MESSAGE}
        emptyNotice="Contact details are being set up. Please check back shortly."
      />

      {follow.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--border)] pt-3">
          <span className="text-[length:var(--text-sm)] text-ink-3">
            See what we have been listing on
          </span>
          <FollowLinks links={follow} variant="solid" />
        </div>
      )}
    </div>
  );
}
