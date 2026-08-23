import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * A request-scoped Supabase client for Server Components, Server Actions and
 * Route Handlers.
 *
 * A fresh client is created per render — never share one across requests, or
 * one visitor's session leaks into another's.
 *
 * Server Components cannot write cookies. When a token refresh happens during a
 * render, `setAll` throws and we swallow it: `middleware.ts` has already
 * refreshed the session and written the cookies for this request, so the
 * refresh is not lost.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where the response has already
          // begun. Safe to ignore — middleware owns session refresh.
        }
      },
    },
  });
}
