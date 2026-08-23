import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AccountNotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface">
        <EmptyState
          title="That account is not available"
          description="It may have been sold and taken down, or the link may be wrong. Everything currently listed is on the browse page."
          action={
            <Link href="/accounts">
              <Button variant="primary">Browse accounts</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
