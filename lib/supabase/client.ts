"use client";

import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * The browser Supabase client.
 *
 * `createBrowserClient` is a singleton per browsing context, so calling this
 * from several components does not open several connections or fight over the
 * auth cookie.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
