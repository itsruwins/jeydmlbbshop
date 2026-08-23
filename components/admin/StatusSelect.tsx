"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { updateAccountStatus } from "@/functions/accounts/updateAccountStatus";
import { ACCOUNT_STATUSES, STATUS_LABELS, type AccountStatus } from "@/types/account";

/**
 * Changes a listing's status from the table.
 *
 * Moving something to "sold" is the single most frequent edit, and it should
 * not require opening a form. The change is optimistic — the select shows the
 * new value immediately and rolls back if the write fails — because the round
 * trip is long enough that waiting reads as a broken control.
 */
export function StatusSelect({
  accountId,
  accountReference,
  status,
}: {
  accountId: string;
  accountReference: string;
  status: AccountStatus;
}) {
  const [value, setValue] = useState<AccountStatus>(status);
  const [saving, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const change = (next: AccountStatus) => {
    const previous = value;
    setValue(next);

    startTransition(async () => {
      const result = await updateAccountStatus(accountId, next);

      if (!result.ok) {
        setValue(previous);
        toast.error(result.message);
        return;
      }

      toast.success(`${accountReference} is now ${STATUS_LABELS[next].toLowerCase()}.`);
      router.refresh();
    });
  };

  return (
    <>
      <label htmlFor={`status-${accountId}`} className="sr-only">
        Status for {accountReference}
      </label>
      <Select
        id={`status-${accountId}`}
        value={value}
        disabled={saving}
        onChange={(event) => change(event.target.value as AccountStatus)}
        className="hit-target h-8 min-w-[7.5rem] text-[length:var(--text-sm)]"
      >
        {ACCOUNT_STATUSES.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option]}
          </option>
        ))}
      </Select>
    </>
  );
}
