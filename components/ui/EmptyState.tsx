import type { ReactNode } from "react";

/**
 * Empty states teach the screen: what it is for, and the single action that
 * fills it. "No data" tells someone nothing they did not already know.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <h3 className="text-[length:var(--text-md)] font-semibold text-ink">
        {title}
      </h3>
      <p className="max-w-sm text-ink-3">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
