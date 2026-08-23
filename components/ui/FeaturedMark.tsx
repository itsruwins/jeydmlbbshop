import { cn } from "@/lib/utils/cn";

/**
 * The featured indicator — one of the few places the amber accent appears as a
 * fill. Not featured renders nothing rather than a greyed-out star, so a
 * column of these reads as a sparse list of exceptions instead of noise.
 */
export function FeaturedMark({
  featured,
  className,
}: {
  featured: boolean;
  className?: string;
}) {
  if (!featured) {
    return (
      <span className="sr-only">Not featured</span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 text-accent-ink", className)}>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 fill-current">
        <path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.6z" />
      </svg>
      <span className="sr-only">Featured</span>
    </span>
  );
}
