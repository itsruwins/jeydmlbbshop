import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountGallery } from "@/components/accounts/AccountGallery";
import { ContactCTA } from "@/components/accounts/ContactCTA";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAccountByReference } from "@/functions/accounts/getAccountByReference";
import { getSocialLinks } from "@/functions/socialLinks/getSocialLinks";
import { imagePublicUrl } from "@/lib/utils/imagePublicUrl";
import { formatCount, formatPrice, orDash } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: PageProps<"/accounts/[reference]">): Promise<Metadata> {
  const { reference } = await params;
  const account = await getAccountByReference(decodeURIComponent(reference));

  if (!account) return { title: "Account not found" };

  const name = account.account_reference;
  const cover =
    account.images.find((image) => image.is_cover) ?? account.images[0];

  const description = [
    account.rank?.name,
    account.collection_level?.name,
    account.skin_count !== null ? `${account.skin_count} skins` : null,
    formatPrice(account.price),
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title: name,
    description,
    // These links get pasted straight into social posts, so the preview card
    // is the first thing most buyers actually see.
    openGraph: {
      title: `${name} — ${formatPrice(account.price)}`,
      description,
      images: cover ? [{ url: imagePublicUrl(cover.storage_path) }] : undefined,
      type: "website",
    },
  };
}

export default async function AccountDetailPage({
  params,
}: PageProps<"/accounts/[reference]">) {
  const { reference } = await params;

  const [account, socialLinks] = await Promise.all([
    getAccountByReference(decodeURIComponent(reference)),
    getSocialLinks(),
  ]);

  // Not found and not public are the same answer, so a hidden draft cannot be
  // confirmed to exist by probing references.
  if (!account) notFound();

  const specs = [
    { label: "Rank", value: orDash(account.rank?.name) },
    { label: "Collection level", value: orDash(account.collection_level?.name) },
    { label: "Skins", value: formatCount(account.skin_count) },
    { label: "Heroes", value: formatCount(account.hero_count) },
    { label: "ID & Server", value: orDash(account.server) },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/accounts"
        className="mb-5 inline-block text-[length:var(--text-sm)] text-ink-3 underline-offset-2 hover:text-ink-2 hover:underline"
      >
        ← All accounts
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10">
        {/* Gallery leads on every size — it is the evidence the sale rests on. */}
        <div className="min-w-0">
          <AccountGallery
            images={account.images}
            label={account.account_reference}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-col gap-3">
            {/* Wrapped so the badge sizes to its label. The header is a column
                flex container, so a bare badge stretches the full width of it
                and reads as a banner rather than a chip. */}
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={account.status} />
            </div>

            {/* The reference is the heading now that there is no title. It has
                to be *a* heading regardless: a listing page whose only <h1> was
                conditional shipped with no <h1> at all whenever the title was
                blank, which leaves a screen reader with nothing to announce the
                page as. */}
            <h1 className="font-mono text-[length:var(--text-xl)] font-semibold leading-snug tracking-[-0.01em] text-ink sm:text-[length:var(--text-2xl)]">
              {account.account_reference}
            </h1>

            <p className="tabular text-[length:var(--text-3xl)] font-semibold leading-none tracking-[-0.02em] text-ink">
              {formatPrice(account.price)}
            </p>
          </header>

          <ContactCTA
            reference={account.account_reference}
            price={account.price}
            status={account.status}
            socialLinks={socialLinks}
          />

          <section className="flex flex-col gap-3">
            <h2 className="text-[length:var(--text-sm)] font-medium tracking-[0.005em] text-ink-3">
              Account details
            </h2>
            <dl className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface">
              {specs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`flex items-baseline justify-between gap-4 px-4 py-2.5 ${
                    index > 0 ? "border-t border-[var(--border)]" : ""
                  }`}
                >
                  <dt className="text-ink-3">{spec.label}</dt>
                  <dd className="tabular text-right font-medium text-ink">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

        </div>
      </div>
    </div>
  );
}
