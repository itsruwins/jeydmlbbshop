import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";

/**
 * The public shell. Header and footer are shared by every buyer-facing page;
 * the admin lives in its own group and shares none of it.
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
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
