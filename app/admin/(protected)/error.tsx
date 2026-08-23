"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";

/**
 * The last line of defence for the admin section.
 *
 * Shows what failed and offers a retry, rather than the blank screen an
 * unhandled error would otherwise leave behind. The message is whatever the
 * data functions threw — those are written to be readable, so surfacing one is
 * more useful than replacing it with "something went wrong".
 */
export default function AdminError({
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
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface px-6 py-14 text-center">
      <h1 className="text-[length:var(--text-md)] font-semibold">
        This screen could not load
      </h1>
      <p className="text-ink-3">
        {error.message || "Something went wrong while loading your data."}
      </p>
      <Button variant="primary" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
