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
          Where the site sends people. The shop takes no payments, so these
          links are how every buyer and seller reaches you.
        </p>
        <p className="max-w-[65ch] text-ink-3">
          Each one is either somewhere to <strong className="font-medium text-ink-2">message you</strong> —
          the first active one becomes the main button on every listing and on
          the seller page — or somewhere to <strong className="font-medium text-ink-2">follow you</strong>,
          which appears as an icon in the header, the footer and the homepage
          instead.
        </p>
      </header>

      <SocialLinksManager links={links} />
    </div>
  );
}
