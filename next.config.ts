import type { NextConfig } from "next";

/**
 * The Supabase Storage host, derived from the project URL rather than typed
 * out, so moving to another Supabase project needs no code change.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    // Screenshots are already converted to WebP in the browser before upload;
    // AVIF here buys a further reduction on the public marketplace.
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
