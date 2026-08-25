import type { NextConfig } from "next";

/**
 * The Supabase Storage host, derived from the project URL rather than typed
 * out, so moving to another Supabase project needs no code change.
 *
 * This is read when Next loads the config, which is earlier and less forgiving
 * than the app's own env handling: if `.env.local` is missing — a fresh clone,
 * a deploy with the variable unset — the value is simply `undefined` here. That
 * used to leave `remotePatterns` empty, and an empty list does not fail at
 * startup. It fails later, on every listing screenshot, as
 * "hostname ... is not configured under images in your `next.config.js`".
 *
 * So the fallback below keeps screenshots rendering from any Supabase project,
 * and the warning says what to fix. The path is still pinned to the public
 * Storage prefix, so this widens the host, not what may be served.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

if (!supabaseHost) {
  console.warn(
    "[next.config] NEXT_PUBLIC_SUPABASE_URL is not set. Falling back to " +
      "*.supabase.co for image hosts. Set it in .env.local (locally) or in " +
      "your hosting provider's environment variables.",
  );
}

const nextConfig: NextConfig = {
  /**
   * Headers for the admin section, including the login page.
   *
   * `robots: { index: false }` in page metadata already emits a `<meta>` tag,
   * but only into HTML that a crawler chose to render. `X-Robots-Tag` is the
   * same instruction as a response header, so it also covers the redirect a
   * signed-out request receives and anything served that is not a document.
   * `noarchive` additionally asks crawlers not to keep a cached copy.
   *
   * `no-store` is the more important of the two. Admin pages are rendered per
   * session and some carry data no visitor should ever see; without it, any
   * shared cache between the app and the browser is free to keep a copy of a
   * signed-in response and hand it to the next person. The proxy already sets
   * cache headers on responses that write auth cookies — this covers the rest.
   *
   * None of this hides the login page from someone who guesses the path, and
   * it is not meant to. Sign-in attempts are rate-limited by Supabase Auth,
   * not here: a per-process counter would reset on every cold start and read
   * as protection while providing none.
   */
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },

  images: {
    // Screenshots are already converted to WebP in the browser before upload;
    // AVIF here buys a further reduction on the public marketplace.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost ?? "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
