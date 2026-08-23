"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  /** Must name the specific record. "Delete this item?" is not enough. */
  children: ReactNode;
  confirmLabel: string;
  confirmingLabel: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * A confirmation for destructive, irreversible work only.
 *
 * Everything reversible stays inline. Confirming ordinary actions trains people
 * to click through the dialog, which is exactly when it stops protecting them.
 *
 * Built on the native `<dialog>` element, so focus trapping, the top layer,
 * Escape-to-close and inert background come from the platform rather than from
 * hand-written focus management that will be subtly wrong.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  confirmingLabel,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      // Escape fires `cancel`. Ignore it mid-delete so the dialog cannot be
      // dismissed while the request it describes is still in flight.
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      onClose={() => {
        if (!busy) onCancel();
      }}
      className={[
        "m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] p-0",
        "border border-[var(--border)] bg-surface text-ink shadow-[var(--shadow-dialog)]",
        "backdrop:bg-[var(--scrim)] motion-safe:animate-[pop-in_var(--dur)_var(--ease-out)]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 p-5">
        <h2 className="text-[length:var(--text-md)] font-semibold text-ink">
          {title}
        </h2>

        <div className="text-ink-2">{children}</div>

        {error && (
          <p
            role="alert"
            className="rounded-[var(--radius-sm)] border border-[var(--danger-border)] bg-danger-bg px-3 py-2 text-[length:var(--text-sm)] text-danger-ink"
          >
            {error}
          </p>
        )}

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={busy}
            loadingLabel={confirmingLabel}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
