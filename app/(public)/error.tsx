"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

/**
 * The buyer-facing failure state.
 *
 * Without this, a Supabase outage during a render drops a visitor onto Next's
 * unstyled default — no header, no navigation, and no indication the site is
 * still there. Someone arriving from a social post would simply leave.
 *
 * The message stays generic on purpose. The admin boundary surfaces the real
 * error because the admin can act on it; a buyer cannot, and a database error
 * string tells them nothing except that something is broken.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="text-[length:var(--text-lg)] font-semibold text-ink">
        Something went wrong
      </h1>
      <p className="max-w-[45ch] text-ink-2">
        We could not load this page just now. It is usually temporary — try
        again in a moment.
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
        <Link href="/accounts">
          <Button variant="secondary" className="w-full sm:w-auto">
            Browse accounts
          </Button>
        </Link>
      </div>
    </div>
  );
}
