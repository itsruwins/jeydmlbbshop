"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SHOP } from "@/lib/constants/shop";
import { cn } from "@/lib/utils/cn";

/**
 * Nav items are named for what they contain. "Browse accounts" and "Sell yours"
 * say what is behind them; "Home" and "Services" would not.
 */
const LINKS = [
  // `short` is what a phone shows. The full labels plus the theme control do
  // not fit across 390px, and a nav item that wraps onto two lines reads as
  // broken rather than as thorough.
  { href: "/accounts", label: "Browse accounts", short: "Accounts" },
  { href: "/sell", label: "Sell yours", short: "Sell" },
] as const;

/**
 * The public header.
 *
 * A translucent layer with the page scrolling underneath rather than an opaque
 * bar that permanently consumes a strip of a phone screen. `prefers-reduced-
 * transparency` turns it solid.
 *
 * No social links here. They were tried beside the theme toggle and read as
 * chrome: a follow link sitting next to a settings control is something you
 * skip past, not something you press. They live where someone is already
 * looking at the shop rather than at the furniture — the hero's fact row, the
 * footer, and under the message buttons on the listing and seller pages.
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--border)] bg-[var(--surface-translucent)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-16">
        {/* The wordmark splits at `sm`: a phone gets the short form so the
            name never competes with the navigation for the same 40px. */}
        <Link
          href="/"
          className="wordmark flex min-h-11 shrink-0 items-center text-[length:var(--text-lg)] text-ink"
          aria-label={SHOP.name}
        >
          <span className="sm:hidden">{SHOP.shortName}</span>
          <span className="hidden sm:inline">{SHOP.name}</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
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
                    "flex min-h-11 items-center whitespace-nowrap rounded-[var(--radius)] px-2.5 text-[length:var(--text-sm)]",
                    "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                    current
                      ? "font-medium text-ink"
                      : "text-ink-2 hover:bg-surface-3 hover:text-ink",
                  )}
                >
                  <span className="sm:hidden">{link.short}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
