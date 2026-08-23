import type { Metadata } from "next";
import Link from "next/link";

import { StatRow } from "@/components/admin/StatRow";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAccountStats } from "@/functions/accounts/getAccountStats";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardPage() {
  const stats = await getAccountStats();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1>Overview</h1>
          <p className="text-ink-3">Your account catalogue at a glance.</p>
        </div>

        <Link href="/admin/accounts/new">
          <Button variant="primary">New listing</Button>
        </Link>
      </header>

      <StatRow stats={stats} />

      {stats.total === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface">
          <EmptyState
            title="No listings yet"
            description="Create your first listing to start building the catalogue. You can add screenshots straight after saving it."
            action={
              <Link href="/admin/accounts/new">
                <Button variant="primary">Create a listing</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <p className="text-ink-3">
          {stats.available > 0
            ? `${stats.available} listing${stats.available === 1 ? "" : "s"} ${stats.available === 1 ? "is" : "are"} available to buyers right now.`
            : "No listings are currently available to buyers."}{" "}
          <Link
            href="/admin/accounts"
            className="text-accent-ink underline underline-offset-2"
          >
            Manage accounts
          </Link>
        </p>
      )}
    </div>
  );
}
