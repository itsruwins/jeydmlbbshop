import { ACCOUNT_IMAGES_BUCKET, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * The public URL for a stored screenshot.
 *
 * Built by string concatenation rather than through the Supabase client so it
 * can be called from a Server Component render without constructing a client
 * for what is a pure path calculation. The bucket is public, so these URLs need
 * no signing and no expiry.
 */
export function imagePublicUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${ACCOUNT_IMAGES_BUCKET}/${storagePath}`;
}
