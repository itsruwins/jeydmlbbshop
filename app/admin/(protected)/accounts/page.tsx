import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { AccountsResults } from "@/components/admin/AccountsResults";
import { Button } from "@/components/ui/Button";
import { Skeleton, SkeletonRows } from "@/components/ui/Skeleton";
import { type AccountSort } from "@/functions/accounts/getAccounts";
import { ACCOUNT_STATUSES, type AccountStatus } from "@/types/account";

export const metadata: Metadata = { title: "Accounts" };

const SORTS: AccountSort[] = [
  "newest",
  "oldest",
  "price_desc",
  "price_asc",
  "reference",
];

/** Query strings are user input; anything unrecognised falls back to a default. */
function readStatus(value: unknown): AccountStatus | "all" {
  return typeof value === "string" &&
    (ACCOUNT_STATUSES as readonly string[]).includes(value)
    ? (value as AccountStatus)
    : "all";
}

function readSort(value: unknown): AccountSort {
  return typeof value === "string" && SORTS.includes(value as AccountSort)
    ? (value as AccountSort)
    : "newest";
}

export default async function AccountsPage({
  searchParams,
}: PageProps<"/admin/accounts">) {
  const params = await searchParams;

  const search = typeof params.q === "string" ? params.q : "";
  const status = readStatus(params.status);
  const sort = readSort(params.sort);
  const featured = params.featured === "1";

  const options = { search, status, sort, featuredOnly: featured };
  const filtered = Boolean(search) || status !== "all" || featured;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1>Accounts</h1>
        <Link href="/admin/accounts/new">
          <Button variant="primary">New listing</Button>
        </Link>
      </header>

      {/* Un-keyed, for the same reason as the public catalogue: keying it
          remounts the toolbar on every change, which stole focus from the
          search box on the first debounced keystroke. */}
      <Suspense
        fallback={
          <>
            <Skeleton className="-mt-3 h-4 w-40" />
            <Skeleton className="h-10 w-full" />
            <SkeletonRows rows={8} />
          </>
        }
      >
        <AccountsResults options={options} filtered={filtered} />
      </Suspense>
    </div>
  );
}
