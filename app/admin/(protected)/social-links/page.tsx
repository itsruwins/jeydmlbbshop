import type { Metadata } from "next";

import { SocialLinksManager } from "@/components/admin/SocialLinksManager";
import { getAllSocialLinks } from "@/functions/socialLinks/getAllSocialLinks";

export const metadata: Metadata = { title: "Social links" };

export default async function SocialLinksPage() {
  const links = await getAllSocialLinks();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1>Social links</h1>
        <p className="max-w-[65ch] text-ink-3">
          Where “Message us” sends people. The site takes no payments, so these
          links are how every buyer and seller reaches you. The first active one
          becomes the main button on every listing and on the seller page.
        </p>
      </header>

      <SocialLinksManager links={links} />
    </div>
  );
}
