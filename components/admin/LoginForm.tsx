"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
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
          className="flex items-start gap-2 rounded-[var(--radius)] border border-[var(--danger-border)] bg-danger-bg px-3.5 py-3 text-[length:var(--text-sm)] leading-relaxed text-danger-ink"
        >
          <svg
            viewBox="0 0 20 20"
            className="mt-px size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="7.2" />
            <path d="M10 6.4v4.2" />
            <path d="M10 13.4h.01" />
          </svg>
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
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          invalid={Boolean(error)}
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
