import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountForm } from "@/components/admin/AccountForm";
import { DeleteAccountButton } from "@/components/admin/DeleteAccountButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAccountById } from "@/functions/accounts/getAccountById";
import { getCollectionLevels } from "@/functions/collectionLevels/getCollectionLevels";
import { getRanks } from "@/functions/ranks/getRanks";
import { formatDate } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: PageProps<"/admin/accounts/[id]/edit">): Promise<Metadata> {
  const { id } = await params;
  const account = await getAccountById(id);
  return { title: account ? account.account_reference : "Listing" };
}

export default async function EditAccountPage({
  params,
}: PageProps<"/admin/accounts/[id]/edit">) {
  const { id } = await params;

  const [account, ranks, collectionLevels] = await Promise.all([
    getAccountById(id),
    getRanks(),
    getCollectionLevels(),
  ]);

  // Missing and not-permitted are the same response on purpose — confirming a
  // record exists is itself a disclosure.
  if (!account) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/admin/accounts"
          className="w-fit text-[length:var(--text-sm)] text-ink-3 underline-offset-2 hover:text-ink-2 hover:underline"
        >
          ← Accounts
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-mono text-[length:var(--text-xl)]">
                {account.account_reference}
              </h1>
              <StatusBadge status={account.status} />
            </div>
            <p className="text-ink-3">
              Created {formatDate(account.created_at)} · Last edited{" "}
              {formatDate(account.updated_at)}
            </p>
          </div>

          <DeleteAccountButton
            accountId={account.id}
            accountReference={account.account_reference}
            imageCount={account.images.length}
            redirectTo="/admin/accounts"
            variant="secondary"
            size="md"
            label="Delete"
          />
        </div>
      </header>

      <AccountForm
        account={account}
        ranks={ranks}
        collectionLevels={collectionLevels}
      />

      <div className="border-t border-[var(--border)] pt-8">
        <ImageUploader accountId={account.id} initialImages={account.images} />
      </div>
    </div>
  );
}
