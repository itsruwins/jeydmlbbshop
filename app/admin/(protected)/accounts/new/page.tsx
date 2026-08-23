import type { Metadata } from "next";
import Link from "next/link";

import { AccountForm } from "@/components/admin/AccountForm";
import { getCollectionLevels } from "@/functions/collectionLevels/getCollectionLevels";
import { generateAccountReference } from "@/functions/accounts/generateAccountReference";
import { getRanks } from "@/functions/ranks/getRanks";

export const metadata: Metadata = { title: "New listing" };

export default async function NewAccountPage() {
  // Fetched together — none of the three depends on another, so waiting for
  // them in sequence would triple the time to first paint for no reason.
  const [ranks, collectionLevels, suggestedReference] = await Promise.all([
    getRanks(),
    getCollectionLevels(),
    generateAccountReference(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link
          href="/admin/accounts"
          className="w-fit text-[length:var(--text-sm)] text-ink-3 underline-offset-2 hover:text-ink-2 hover:underline"
        >
          ← Accounts
        </Link>
        <h1>New listing</h1>
        <p className="text-ink-3">
          Save the details first — screenshots are added on the next screen.
        </p>
      </header>

      <AccountForm
        account={null}
        ranks={ranks}
        collectionLevels={collectionLevels}
        suggestedReference={suggestedReference}
      />
    </div>
  );
}
