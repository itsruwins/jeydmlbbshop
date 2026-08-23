"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

/**
 * Nav items are named for what they contain. "Browse accounts" and "Sell yours"
 * say what is behind them; "Home" and "Services" would not.
 */
const LINKS = [
  { href: "/accounts", label: "Browse accounts" },
  { href: "/sell", label: "Sell yours" },
] as const;

/**
 * The public header.
 *
 * A translucent layer with the page scrolling underneath rather than an opaque
 * bar that permanently consumes a strip of a phone screen. `prefers-reduced-
 * transparency` turns it solid.
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--border)] bg-[var(--surface-translucent)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-16">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center font-semibold tracking-[-0.01em] text-ink"
        >
          MLBB Shop
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {LINKS.map((link) => {
            const current =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  // min-h-11 is 44px: the minimum a thumb hits reliably. These
                  // are the only navigation on a phone, so they have to be
                  // comfortable rather than merely clickable.
                  "flex min-h-11 items-center rounded-[var(--radius)] px-2.5 text-[length:var(--text-sm)]",
                  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                  current
                    ? "font-medium text-ink"
                    : "text-ink-2 hover:bg-surface-3 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
