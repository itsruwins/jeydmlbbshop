"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

import { NAV_ITEMS, isCurrent } from "./navItems";

/**
 * The nav links, shared by the desktop sidebar and the mobile drawer so the
 * two can never disagree about what exists or which item is current.
 *
 * Current state is carried by an amber left marker plus a heavier weight and
 * a raised surface — never by colour alone.
 */
export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "relative flex h-11 items-center rounded-[var(--radius)] px-3",
              "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
              current
                ? "bg-surface font-medium text-ink"
                : "text-ink-2 hover:bg-surface hover:text-ink",
            )}
          >
            {current && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent"
              />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
