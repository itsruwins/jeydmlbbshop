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
