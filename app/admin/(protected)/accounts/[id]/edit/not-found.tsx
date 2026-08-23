import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AccountNotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface">
      <EmptyState
        title="Listing not found"
        description="It may have been deleted, or the link may be wrong."
        action={
          <Link href="/admin/accounts">
            <Button variant="primary">Back to accounts</Button>
          </Link>
        }
      />
    </div>
  );
}
