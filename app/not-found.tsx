import Link from "next/link";

import { Button } from "@/components/ui/Button";

/**
 * The catch-all 404, for URLs that match no route at all.
 *
 * Route-specific not-found files handle the cases with something useful to say
 * — a missing listing points at the catalogue. This one covers everything else,
 * and exists so a mistyped URL still looks like the site rather than a stack of
 * unstyled default text.
 *
 * It renders inside the root layout rather than the public one, so it carries
 * no header or footer; the links below are the way out.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <p className="tabular text-[length:var(--text-sm)] font-medium text-ink-3">
        404
      </p>
      <h1 className="text-[length:var(--text-xl)] font-semibold tracking-[-0.015em] text-ink">
        Page not found
      </h1>
      <p className="max-w-[45ch] text-ink-2">
        That link does not lead anywhere. It may have been removed, or the
        address may be slightly off.
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Link href="/accounts">
          <Button variant="primary" className="w-full sm:w-auto">
            Browse accounts
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" className="w-full sm:w-auto">
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
