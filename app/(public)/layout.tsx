import { AdminLoginDialog } from "@/components/shared/AdminLoginDialog";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";

/**
 * The public shell. Header and footer are shared by every buyer-facing page;
 * the admin lives in its own group and shares none of it.
 *
 * `AdminLoginDialog` is the one exception: it is mounted here so `Ctrl+M`
 * opens the sign-in dialog from anywhere on the storefront rather than only
 * from the homepage. It renders nothing until that happens.
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-[var(--radius)] focus:bg-surface focus:px-3 focus:py-2 focus:shadow-[var(--shadow-pop)]"
      >
        Skip to content
      </a>

      <SiteHeader />

      {/* `relative z-0` is the reason nothing paints over the header.

          It makes <main> a stacking context, so every z-index inside the page
          — the hero's `z-10`, a card's `z-20` badge, the carousel's controls —
          is sorted *within* main and then the whole block is placed below the
          header's `--z-sticky`. Without it those numbers compete with the
          header directly in the root stacking context: the hero's `z-10` ties
          the header's, comes later in the document, and wins.

          Fixing it here rather than by renumbering each offender means the
          next element to reach for a z-index cannot reintroduce the bug.
          Modal dialogs are unaffected — they use the native `<dialog>` top
          layer, which no stacking context can trap. */}
      <main id="main" className="relative z-0 flex-1">
        {children}
      </main>
      <SiteFooter />

      <AdminLoginDialog />
    </div>
  );
}
