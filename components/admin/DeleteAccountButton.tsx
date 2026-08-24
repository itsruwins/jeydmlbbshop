"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { deleteAccount } from "@/functions/accounts/deleteAccount";

/**
 * Deletes a listing, after a confirmation that names it.
 *
 * Deletion removes the screenshots from Storage as well, and none of it can be
 * undone, so this is one of the few places a dialog is warranted. The dialog
 * says how many images will go with it — the consequence people are least
 * likely to have in mind.
 *
 * On success it navigates rather than just refreshing, because after deleting
 * from the edit screen there is no longer a record to stay on.
 */
export function DeleteAccountButton({
  accountId,
  accountReference,
  imageCount,
  redirectTo,
  size = "sm",
  variant = "ghost",
  label = "Delete",
}: {
  accountId: string;
  accountReference: string;
  imageCount: number;
  redirectTo?: string;
  size?: "sm" | "md";
  variant?: "ghost" | "danger" | "secondary";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const confirm = () => {
    setError(null);

    startTransition(async () => {
      const result = await deleteAccount(accountId);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setOpen(false);
      toast.success(`${accountReference} was deleted.`);

      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  };

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className={variant === "ghost" ? "text-ink-3 hover:text-danger-ink" : undefined}
      >
        {label}
        <span className="sr-only"> {accountReference}</span>
      </Button>

      <ConfirmDialog
        open={open}
        title="Delete this listing?"
        confirmLabel="Delete listing"
        confirmingLabel="Deleting…"
        busy={deleting}
        error={error}
        onConfirm={confirm}
        onCancel={() => {
          if (!deleting) setOpen(false);
        }}
      >
        <p>
          <span className="font-medium text-ink">{accountReference}</span>{" "}
          will be permanently removed
          {imageCount > 0
            ? `, along with ${imageCount} screenshot${imageCount === 1 ? "" : "s"}`
            : ""}
          . This cannot be undone.
        </p>
      </ConfirmDialog>
    </>
  );
}
