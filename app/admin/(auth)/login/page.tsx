import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/LoginForm";
import { Button } from "@/components/ui/Button";
import { logoutAdmin } from "@/functions/auth/logoutAdmin";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Both of these mean "you are signed in, but not as someone who may be here",
 * so both offer a way out of the session rather than leaving the person to
 * retry a password that was never the problem.
 */
const ERRORS: Record<string, string> = {
  "not-admin": "That account does not have administrator access.",
  "no-profile":
    "That account is signed in, but has no profile on this site, so there is no access to grant.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;

  const next = typeof params.next === "string" ? params.next : undefined;
  const errorKey = typeof params.error === "string" ? params.error : undefined;
  const sessionError = errorKey ? ERRORS[errorKey] : undefined;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-[22rem]">
        <div className="mb-8 flex flex-col gap-1.5">
          <h1 className="text-[length:var(--text-xl)] font-semibold tracking-[-0.01em] text-ink">
            Sign in
          </h1>
          <p className="text-ink-3">
            Administrator access to the account catalogue.
          </p>
        </div>

        <LoginForm next={next} initialError={sessionError} />

        {sessionError && (
          <form action={logoutAdmin} className="mt-4">
            <Button type="submit" variant="ghost" size="sm" className="w-full">
              Sign out of the current account
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
