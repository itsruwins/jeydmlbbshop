import { SocialGlyph } from "@/components/shared/SocialGlyph";
import { cn } from "@/lib/utils/cn";
import type { SocialLink } from "@/types/socialLink";

/**
 * The places the shop posts, as icons.
 *
 * Separate from `SocialButtons` on purpose. Those are for starting a
 * conversation about a specific listing and carry a pre-written message; these
 * are "here is where we are", and a buyer clicking one is browsing, not
 * buying. Sending someone holding a reference code into a TikTok feed is a dead
 * end, so the two never share a surface.
 *
 * No pre-filled message, no clipboard write, no `openContact` — these are plain
 * anchors, which is why this is a server component with no client bundle.
 *
 * ## The three variants
 *
 * They are three sizes of the same idea, not three designs: `bare` for the
 * header, where the icons sit beside the theme toggle and must not compete
 * with it; `solid` for the footer and the CTA panels, where a bordered target
 * reads as clickable in a block of text; `cards` for the homepage band, which
 * is the one place with room to say which handle is which.
 */

/** What a screen reader hears, since the glyph itself says nothing. */
function nameOf(link: SocialLink): string {
  const label = link.label?.trim();
  const platform = link.platform?.trim() || "social media";
  return label && label !== platform ? `${platform} — ${label}` : platform;
}

export function FollowLinks({
  links,
  variant = "solid",
  label,
  className,
}: {
  links: SocialLink[];
  variant?: "bare" | "solid" | "cards";
  /**
   * Names the row for assistive technology. Required in spirit wherever no
   * visible caption sits beside it — a bare list of icons announces as "list,
   * 3 items" and nothing else.
   */
  label?: string;
  className?: string;
}) {
  if (links.length === 0) return null;

  if (variant === "cards") {
    return (
      <ul aria-label={label} className={cn("flex flex-wrap gap-2.5", className)}>
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              // noreferrer alongside noopener: the destination has no reason to
              // learn which page sent the visitor.
              rel="noopener noreferrer"
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface py-2.5 pl-2.5 pr-4",
                "transition-[border-color,background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                "hover:border-[var(--border-strong)] hover:bg-surface-2",
                "motion-safe:active:scale-[0.98]",
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-2 transition-colors duration-[var(--dur-fast)] group-hover:bg-surface-3 group-hover:text-ink">
                <SocialGlyph platform={link.platform} className="size-[17px]" />
              </span>

              <span className="flex flex-col">
                <span className="text-[length:var(--text-base)] font-medium leading-tight text-ink">
                  {link.platform}
                </span>
                {link.label?.trim() && link.label.trim() !== link.platform && (
                  <span className="text-[length:var(--text-sm)] leading-tight text-ink-3">
                    {link.label.trim()}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  const bare = variant === "bare";

  return (
    <ul
      aria-label={label}
      className={cn("flex items-center", bare ? "gap-0.5" : "gap-2", className)}
    >
      {links.map((link) => (
        <li key={link.id} className="flex">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={nameOf(link)}
            className={cn(
              // .hit-target grows the tap area to 44px without changing the
              // space the icon occupies — the same trick the admin's icon
              // buttons use, for the same reason.
              "hit-target grid shrink-0 place-items-center text-ink-3",
              "transition-[color,background-color,border-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
              "hover:text-ink motion-safe:active:scale-90",
              bare
                ? "size-7 rounded-full hover:bg-surface-3"
                : "size-9 rounded-full border border-[var(--border)] bg-surface hover:border-[var(--border-strong)] hover:bg-surface-2",
            )}
          >
            <SocialGlyph platform={link.platform} className="size-[15px]" />
            <span className="sr-only">{nameOf(link)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
