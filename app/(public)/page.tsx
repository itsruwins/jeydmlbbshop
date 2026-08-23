import type { Metadata } from "next";
import Link from "next/link";

import { AccountGrid } from "@/components/accounts/AccountGrid";
import { Button } from "@/components/ui/Button";
import { getFeaturedAccounts } from "@/functions/accounts/getFeaturedAccounts";

/**
 * Cached and regenerated at most every five minutes.
 *
 * This page reads the featured listings anonymously, which means Next can — and
 * without this line, does — prerender it once at build time and serve that
 * forever. The featured row would then be frozen at whatever existed when the
 * site was deployed.
 *
 * Five minutes is the ceiling, not the usual case: the account mutations call
 * `revalidatePath("/")`, so an edit in the admin shows up here straight away.
 * The window only matters for changes made outside the app.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "MLBB Account Shop",
  description:
    "Mobile Legends: Bang Bang accounts for sale, listed with full screenshots, rank and collection level. Message us to arrange a deal.",
};

export default async function HomePage() {
  const featured = await getFeaturedAccounts(6);

  return (
    <>
      {/* Deliberately short. Visitors arrive from a social post already knowing
          roughly what this is; the job here is to get them to the inventory,
          not to explain the concept. */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-20">
        <div className="flex max-w-2xl flex-col gap-5">
          <h1 className="text-[length:var(--text-3xl)] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[2.75rem]">
            Mobile Legends accounts, shown in full.
          </h1>
          <p className="max-w-xl text-[length:var(--text-md)] leading-relaxed text-ink-2">
            Every listing carries its real rank, collection level and skin count,
            with screenshots to match. Find one you like and message us — we
            handle the rest personally.
          </p>

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
            <Link href="/accounts" className="sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto">
                Browse accounts
              </Button>
            </Link>
            <Link href="/sell" className="sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                Sell your account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Inventory above the fold on anything but a very short phone. */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-[length:var(--text-xl)] font-semibold tracking-[-0.015em] text-ink">
              Featured accounts
            </h2>
            <Link
              href="/accounts"
              className="shrink-0 text-[length:var(--text-sm)] text-accent-ink underline-offset-2 hover:underline"
            >
              See all
            </Link>
          </div>

          <AccountGrid
            accounts={featured}
            priorityCount={3}
            highlightReference
          />
        </section>
      )}

      <section className="border-t border-[var(--border)] bg-surface-2">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="mb-6 text-[length:var(--text-xl)] font-semibold tracking-[-0.015em] text-ink">
            How buying works
          </h2>

          {/* A genuine three-step sequence, so the numbers carry information
              rather than decorating the section. */}
          <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            {[
              {
                title: "Find an account",
                body: "Browse the catalogue and open anything that looks right. Every account has its full screenshot set.",
              },
              {
                title: "Message us",
                body: "Tap the contact button on the account. It opens our social media with its reference ready to send.",
              },
              {
                title: "Arrange the deal",
                body: "We answer your questions, agree the details with you directly, and complete the handover.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <span className="tabular text-[length:var(--text-sm)] font-medium text-accent-ink">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-2">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
