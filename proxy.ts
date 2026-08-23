import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from "@/lib/supabase/env";

const LOGIN_PATH = "/admin/login";
const DASHBOARD_PATH = "/admin/dashboard";

/**
 * Refreshes the Supabase session on every admin request and gates the section
 * on being signed in.
 *
 * Next 16 calls this the proxy convention; it is what earlier versions called
 * middleware, and it still runs before any route renders.
 *
 * This is the *session* gate, not the *authorisation* gate. This layer only
 * establishes that a valid user exists; whether that user is an admin is
 * decided in `app/admin/layout.tsx`, which can query `profiles`, and
 * ultimately by Row Level Security in the database. Splitting it this way
 * keeps the edge check cheap and keeps the authoritative check next to the
 * data it protects.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Responses that set auth cookies must never be cached, or one
        // visitor's token can be served to another.
        for (const [key, headerValue] of Object.entries(headers)) {
          response.headers.set(key, headerValue);
        }
      },
    },
  });

  // getUser() revalidates the token with Supabase. getSession() only reads the
  // cookie, which a client can forge, so it must not be used to gate access.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isLoginPage = pathname === LOGIN_PATH;

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    // Remember where they were headed so login can return them there.
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // A signed-in visitor normally has no reason to see the login page. The
  // exception is when the admin layout sent them here to explain that their
  // session is valid but not authorised — bouncing them back to the dashboard
  // would put them in a redirect loop between the two checks.
  if (user && isLoginPage && !request.nextUrl.searchParams.has("error")) {
    const url = request.nextUrl.clone();
    url.pathname = DASHBOARD_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Only the admin section needs a session. The public marketplace is
  // anonymous, and running auth on it would add a round trip to every page.
  matcher: ["/admin/:path*"],
};
