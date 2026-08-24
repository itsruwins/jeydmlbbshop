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
  // not_null_violation — see notNullMessage(), which names the column
  "23502": "A required field was empty.",
  // insufficient_privilege — RLS refused the write
  "42501":
    "Your account is not authorised to make this change. Sign out and back in, or check that your profile still has the admin role.",
};

/**
 * A not-null violation, with the column named.
 *
 * "A required field was empty" is a dead end when the empty column is one the
 * form does not have — which is exactly what happens after a field is removed
 * from the UI while the database still insists on it. The admin fills in every
 * visible required field, is told a required field is empty, and has nowhere to
 * go. Postgres already says which column; this pulls it out.
 *
 * The message looks like:
 *   null value in column "title" of relation "accounts" violates not-null…
 */
function notNullMessage(error: SupabaseLikeError): string | null {
  const column = /null value in column "([^"]+)"/.exec(error.message ?? "")?.[1];
  if (!column) return null;

  return `The database still requires a value for "${column}", but this form no longer collects one. That column needs to be made nullable.`;
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;

  if (typeof error === "object") {
    const candidate = error as SupabaseLikeError;

    if (candidate.code === "23502") {
      return notNullMessage(candidate) ?? BY_CODE["23502"];
    }

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
