"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { loginAdmin, type LoginResult } from "@/functions/auth/loginAdmin";

/** Split out so `useFormStatus` reads the state of the enclosing form. */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      className="w-full"
      loading={pending}
      loadingLabel="Signing in…"
    >
      Sign in
    </Button>
  );
}

export function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const [state, formAction] = useActionState<LoginResult | null, FormData>(
    loginAdmin,
    initialError ? { error: initialError } : null,
  );

  const error = state?.error;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {error && (
        <p
          role="alert"
          className="rounded-[var(--radius)] border border-[var(--danger-border)] bg-danger-bg px-3.5 py-3 text-[length:var(--text-sm)] text-danger-ink"
        >
          {error}
        </p>
      )}

      <Field id="email" label="Email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoFocus
          required
          invalid={Boolean(error)}
          placeholder="you@example.com"
        />
      </Field>

      <Field id="password" label="Password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={Boolean(error)}
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
