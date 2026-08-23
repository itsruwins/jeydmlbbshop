/**
 * Turns whatever was thrown into something a person can act on.
 *
 * Supabase surfaces Postgres errors by code. The ones below are the failures an
 * admin can actually cause, so each gets a sentence that says what to do rather
 * than echoing "duplicate key value violates unique constraint".
 */

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
};

const BY_CODE: Record<string, string> = {
  // unique_violation
  "23505": "That account reference is already in use. Choose a different one.",
  // foreign_key_violation
  "23503": "That rank or collection level no longer exists. Reload and try again.",
  // check_violation
  "23514": "One of the values is outside the range the database allows.",
  // not_null_violation
  "23502": "A required field was empty.",
  // insufficient_privilege — RLS refused the write
  "42501":
    "Your account is not authorised to make this change. Sign out and back in, or check that your profile still has the admin role.",
};

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;

  if (typeof error === "object") {
    const candidate = error as SupabaseLikeError;

    if (candidate.code && BY_CODE[candidate.code]) {
      return BY_CODE[candidate.code];
    }

    // A failed fetch is almost always the network, not the query.
    if (candidate.message === "Failed to fetch") {
      return "Could not reach the server. Check your connection and try again.";
    }

    if (candidate.message) return candidate.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}
