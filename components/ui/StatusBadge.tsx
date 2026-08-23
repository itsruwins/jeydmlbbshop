import { STATUS_LABELS, type AccountStatus } from "@/types/account";
import { cn } from "@/lib/utils/cn";

/**
 * Status is its own semantic colour family — the amber accent is reserved for
 * interactive state and never used here, or "featured" and "reserved" would be
 * indistinguishable.
 *
 * Hidden carries a dashed border because it is the only status that changes who
 * can see the listing. That needs to register from across the table rather than
 * be read.
 *
 * Colour is never the only signal: the label is always present as text.
 */
const STYLES: Record<AccountStatus, string> = {
  available:
    "text-[var(--status-available-ink)] bg-[var(--status-available-bg)] border-[var(--status-available-border)]",
  reserved:
    "text-[var(--status-reserved-ink)] bg-[var(--status-reserved-bg)] border-[var(--status-reserved-border)]",
  sold: "text-[var(--status-sold-ink)] bg-[var(--status-sold-bg)] border-[var(--status-sold-border)]",
  hidden:
    "text-[var(--status-hidden-ink)] bg-[var(--status-hidden-bg)] border-[var(--status-hidden-border)] border-dashed",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AccountStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5",
        "text-[length:var(--text-xs)] font-medium tracking-[0.01em] whitespace-nowrap",
        STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
