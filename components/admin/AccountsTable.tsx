"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { formatCount, formatDate, formatPrice, orDash } from "@/lib/utils/format";
import { normaliseInstallmentPercents } from "@/lib/utils/installment";
import type { AccountWithRelations } from "@/types/account";

import { DeleteAccountButton } from "./DeleteAccountButton";
import { FeaturedToggle } from "./FeaturedToggle";
import { StatusSelect } from "./StatusSelect";

/**
 * The catalogue.
 *
 * Two intentional layouts rather than one that shrinks. Above `md` this is a
 * real table: the columns genuinely need to align, and density is what makes
 * a catalogue scannable. Below `md` the same data becomes a stacked list,
 * because a ten-column table on a phone is a horizontal-scrolling puzzle.
 *
 * The table scrolls inside its own container so the page body never scrolls
 * sideways.
 */
export function AccountsTable({ accounts }: { accounts: AccountWithRelations[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface md:block">
        <table className="w-full min-w-[68rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-surface-2">
              <Th>Reference</Th>
              <Th align="right">Price</Th>
              <Th>Rank</Th>
              <Th>Collection</Th>
              <Th align="right">Skins</Th>
              <Th>Status</Th>
              <Th>Installment</Th>
              <Th align="center">Featured</Th>
              <Th>Created</Th>
              <Th align="right">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((account) => (
              <tr
                key={account.id}
                className="border-b border-[var(--border)] last:border-b-0 transition-colors duration-[var(--dur-fast)] hover:bg-surface-3"
              >
                <Td>
                  <Link
                    href={`/admin/accounts/${account.id}/edit`}
                    className="font-mono text-[length:var(--text-sm)] text-ink underline-offset-2 hover:underline"
                  >
                    {account.account_reference}
                  </Link>
                </Td>

                <Td align="right" className="tabular font-medium text-ink">
                  {formatPrice(account.price)}
                </Td>

                <Td className="text-ink-2">{orDash(account.rank?.name)}</Td>

                <Td className="max-w-[12rem] text-ink-2">
                  <span className="block truncate" title={account.collection_level?.name}>
                    {orDash(account.collection_level?.name)}
                  </span>
                </Td>

                <Td align="right" className="tabular text-ink-2">
                  {formatCount(account.skin_count)}
                </Td>

                <Td>
                  <StatusSelect
                    accountId={account.id}
                    accountReference={account.account_reference}
                    status={account.status}
                  />
                </Td>

                <Td>
                  <InstallmentCell account={account} />
                </Td>

                <Td align="center">
                  <FeaturedToggle
                    accountId={account.id}
                    accountReference={account.account_reference}
                    isFeatured={account.is_featured}
                  />
                </Td>

                <Td className="tabular whitespace-nowrap text-ink-3">
                  {formatDate(account.created_at)}
                </Td>

                <Td align="right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/accounts/${account.id}/edit`}>
                      <Button size="sm" variant="ghost">
                        Edit
                        <span className="sr-only"> {account.account_reference}</span>
                      </Button>
                    </Link>
                    <DeleteAccountButton
                      accountId={account.id}
                      accountReference={account.account_reference}
                      imageCount={account.images?.length ?? 0}
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="flex flex-col gap-3 md:hidden">
        {accounts.map((account) => (
          <li
            key={account.id}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/accounts/${account.id}/edit`}
                  className="block truncate font-mono font-medium text-ink"
                >
                  {account.account_reference}
                </Link>
              </div>

              <FeaturedToggle
                accountId={account.id}
                accountReference={account.account_reference}
                isFeatured={account.is_featured}
              />
            </div>

            <p className="tabular text-[length:var(--text-lg)] font-semibold tracking-[-0.005em] text-ink">
              {formatPrice(account.price)}
            </p>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[length:var(--text-sm)]">
              <Detail label="Rank" value={orDash(account.rank?.name)} />
              <Detail label="Skins" value={formatCount(account.skin_count)} />
              <Detail
                label="Collection"
                value={orDash(account.collection_level?.name)}
                className="col-span-2"
              />
              <Detail label="Created" value={formatDate(account.created_at)} />
              <Detail
                label="Installment"
                value={installmentSummary(account)}
              />
            </dl>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
              <StatusSelect
                accountId={account.id}
                accountReference={account.account_reference}
                status={account.status}
              />
              <div className="ml-auto flex gap-1">
                <Link href={`/admin/accounts/${account.id}/edit`}>
                  <Button size="sm" variant="secondary">
                    Edit
                  </Button>
                </Link>
                <DeleteAccountButton
                  accountId={account.id}
                  accountReference={account.account_reference}
                  imageCount={account.images?.length ?? 0}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      scope="col"
      className={[
        "px-3 py-2.5 text-[length:var(--text-sm)] font-medium tracking-[0.005em] text-ink-3 whitespace-nowrap",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <td
      className={[
        "px-3 py-2.5 align-middle",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className,
      ].join(" ")}
    >
      {children}
    </td>
  );
}

/**
 * What the listing is offering, as a sentence short enough for a table cell.
 *
 * The percentages rather than the pesos. This table is scanned across many
 * rows at different prices, where "50 / 80%" is one shape to compare and four
 * peso figures are not; the money is on the listing page, where there is one
 * price to relate it to.
 */
function installmentSummary(
  account: Pick<AccountWithRelations, "installment_available" | "installment_percents">,
): string {
  if (!account.installment_available) return "—";
  const percents = normaliseInstallmentPercents(account.installment_percents);
  // Only reachable if a row was edited by hand past the CHECK constraint that
  // pairs the flag with the terms. Better a visible oddity than a bare dash
  // that looks like the flag is simply off.
  if (percents.length === 0) return "Open, no terms";
  return `${percents.join(" / ")}%`;
}

function InstallmentCell({ account }: { account: AccountWithRelations }) {
  const summary = installmentSummary(account);

  if (!account.installment_available) {
    return <span className="text-ink-3">{summary}</span>;
  }

  return (
    <span className="tabular inline-flex items-center whitespace-nowrap rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[length:var(--text-xs)] font-medium text-accent-ink">
      {summary}
    </span>
  );
}

function Detail({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-ink-3">{label}</dt>
      <dd className="tabular truncate text-ink-2">{value}</dd>
    </div>
  );
}
