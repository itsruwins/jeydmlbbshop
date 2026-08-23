/**
 * Supabase connection details, read once and validated loudly.
 *
 * Both values are public by design: the URL is the REST origin and the
 * publishable key is filtered by Row Level Security on every request. There is
 * no service-role key in this project, and there must never be one — bypassing
 * RLS would move authorisation out of the database and into the browser.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const SUPABASE_URL = required(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_PUBLISHABLE_KEY = required(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

/** The one bucket this project uses. Public read, admin-only write. */
export const ACCOUNT_IMAGES_BUCKET = "account-images";
