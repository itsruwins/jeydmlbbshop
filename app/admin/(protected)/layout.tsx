import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/ui/Toast";
import { requireAdmin } from "@/functions/auth/checkAdmin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The authorisation boundary for every admin screen.
 *
 * `requireAdmin()` runs on the server before any child renders, so a non-admin
 * never receives the markup — the dashboard is not sent and then hidden.
 */
export default async function ProtectedAdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const profile = await requireAdmin();

  return (
    <ToastProvider>
      <AdminShell email={profile.email}>{children}</AdminShell>
    </ToastProvider>
  );
}
