"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { logoutAdmin } from "@/functions/auth/logoutAdmin";

import { AdminNav } from "./AdminNav";

/**
 * The admin chrome: a persistent sidebar from `lg` up, and a top bar plus a
 * slide-in drawer below it.
 *
 * This is a different layout at each size rather than a squeezed one. A
 * 240px sidebar compressed onto a phone would leave nothing for the table that
 * is the actual work.
 */
export function AdminShell({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  // Closed by the link handlers themselves — every navigation inside the
  // drawer calls onNavigate — so no effect has to watch the pathname for it.
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The drawer covers the page; the page behind it must not scroll away.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg lg:flex-row">
      {/* Keyboard users should not have to tab the whole nav on every page. */}
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-[var(--radius)] focus:bg-surface focus:px-3 focus:py-2 focus:shadow-[var(--shadow-pop)]"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-surface-2 lg:flex">
        <SidebarBody email={email} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-[var(--z-sticky)] flex h-14 items-center justify-between gap-2 border-b border-[var(--border)] bg-surface-2 px-3 lg:hidden">
        <Link
          href="/admin/dashboard"
          className="font-semibold tracking-[-0.005em] text-ink"
        >
          MLBB Shop
        </Link>
        <Button
          size="sm"
          variant="ghost"
          aria-expanded={drawerOpen}
          aria-controls="admin-drawer"
          onClick={() => setDrawerOpen(true)}
        >
          Menu
        </Button>
      </header>

      {/* Mobile drawer. Enters and leaves along the same path, from the left. */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[var(--z-drawer-backdrop)] bg-[var(--scrim)] motion-safe:animate-[fade-in_var(--dur-fast)_var(--ease-out)] lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            id="admin-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Admin sections"
            className="fixed inset-y-0 left-0 z-[var(--z-drawer)] flex w-64 flex-col border-r border-[var(--border)] bg-surface-2 motion-safe:animate-[slide-in-left_var(--dur)_var(--ease-out)] lg:hidden"
          >
            <SidebarBody email={email} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      <main
        id="admin-content"
        className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      >
        {children}
      </main>
    </div>
  );
}

function SidebarBody({
  email,
  onNavigate,
}: {
  email: string | null;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-14 shrink-0 items-center px-4 lg:h-16">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="font-semibold tracking-[-0.005em] text-ink"
        >
          MLBB Shop
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <AdminNav onNavigate={onNavigate} />
      </div>

      <div className="shrink-0 border-t border-[var(--border)] p-3">
        {email && (
          <p
            className="mb-2 truncate px-1 text-[length:var(--text-sm)] text-ink-3"
            title={email}
          >
            {email}
          </p>
        )}
        <form action={logoutAdmin}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
            Sign out
          </Button>
        </form>
      </div>
    </>
  );
}
