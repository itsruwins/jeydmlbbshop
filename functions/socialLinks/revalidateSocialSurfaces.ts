import { revalidatePath } from "next/cache";

/**
 * Refreshes every page that renders a social destination.
 *
 * Social links appear in the footer — which is in the public layout, so it is
 * on every buyer-facing page — plus both seller CTAs and every listing's
 * contact button. The homepage and the seller page are cached with a
 * revalidate window, so without this an edited link would keep sending people
 * to the old destination for up to five minutes.
 *
 * Kept in one place because "which pages show a social link?" is exactly the
 * question that gets answered wrong when it is duplicated across four mutation
 * files.
 */
export function revalidateSocialSurfaces(): void {
  revalidatePath("/");
  revalidatePath("/sell");
  revalidatePath("/accounts");
  revalidatePath("/accounts/[reference]", "page");
}
