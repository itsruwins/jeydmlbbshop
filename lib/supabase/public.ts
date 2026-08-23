import { createServerClient } from "@supabase/ssr";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * A deliberately anonymous Supabase client for buyer-facing pages.
 *
 * It reads no cookies, so every request it makes is evaluated by Row Level
 * Security as `anon` — regardless of who is holding the browser.
 *
 * This exists because of a real bug. The public marketplace originally used the
 * session-aware client from `./server`. That client forwards the visitor's
 * cookies, so when the shop owner browsed their own catalogue while signed into
 * the admin, RLS quite correctly granted them admin visibility and hidden
 * drafts appeared on `/accounts`. A logged-out visitor never saw them, which is
 * exactly what makes the bug easy to miss: the page behaves differently
 * depending on who looks at it.
 *
 * A public page has no business knowing who is viewing it. Reading it as `anon`
 * means what the owner sees is what a stranger sees.
 */
export function createPublicClient() {
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      // No session, by design. Not an oversight — see above.
      getAll() {
        return [];
      },
      setAll() {
        // Anonymous reads never establish a session, so there is nothing to
        // write back.
      },
    },
  });
}
