import type { Metadata } from "next";
import Link from "next/link";

import { AccountGrid } from "@/components/accounts/AccountGrid";
import { FeaturedListing } from "@/components/home/FeaturedListing";
import { VouchCard, VouchWall } from "@/components/home/VouchWall";
import { VOUCHES } from "@/components/home/vouches";
import { Button } from "@/components/ui/Button";
import { getPublicAccounts } from "@/functions/accounts/getPublicAccounts";
import { getSocialLinks } from "@/functions/socialLinks/getSocialLinks";
import { SHOP } from "@/lib/constants/shop";
import { contactUrl } from "@/lib/utils/contactUrl";

/**
 * Cached and regenerated at most every five minutes.
 *
 * This page reads listings anonymously, which means Next can — and without this
 * line, does — prerender it once at build time and serve that forever. The
 * storefront would then be frozen at whatever stock existed when the site was
 * deployed.
 *
 * Five minutes is the ceiling, not the usual case: the account mutations call
 * `revalidatePath("/")`, so an edit in the admin shows up here straight away.
 * The window only matters for changes made outside the app.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: `${SHOP.name} — Mobile Legends accounts, handed over personally`,
  },
  description:
    "Mobile Legends: Bang Bang accounts listed with their full screenshot set, real rank, collection level and skin count. Message us and we arrange the handover directly.",
};

/**
 * How many pieces of feedback stand in the hero.
 *
 * Two, because the hero has to be readable in one glance and a third quote
 * turns it into a page to read. The rest go to the wall further down.
 */
const HERO_VOUCHES = 2;

/**
 * The claims that are not the sold count.
 *
 * The count is the headline on this version, so repeating it here would be the
 * page arguing with itself. What is left is what a buyer weighs *after* they
 * believe the shop is real: how fast someone answers, what they can check
 * before paying, and who they are dealing with.
 */
const CREDENTIALS = [
  `Replies ${SHOP.replyTime}`,
  "Full screenshot set on every listing",
  "Handover done with you directly",
];

const STEPS = [
  {
    title: "Open a listing",
    body: "Every account shows its full screenshot set, rank, collection level, skin count and server. Read all of it before you say a word to us.",
  },
  {
    title: "Message us",
    body: "The contact button opens our Facebook with the account's reference ready to send. Ask anything — the account is not going anywhere while you decide.",
  },
  {
    title: "Arrange the handover",
    body: "We agree the details with you directly, walk through the email and binding change together, and stay with it until the account is yours.",
  },
];

export default async function HomePage() {
  const [catalogue, socials] = await Promise.all([
    getPublicAccounts({ sort: "newest" }),
    getSocialLinks(),
  ]);

  const lead =
    catalogue.available.find((account) => account.is_featured) ??
    catalogue.available[0] ??
    null;

  const rest = lead
    ? catalogue.available.filter((account) => account.id !== lead.id)
    : [];

  const heroVouches = VOUCHES.slice(0, HERO_VOUCHES);
  const wallVouches = VOUCHES.slice(HERO_VOUCHES);

  const primarySocial = socials[0];
  const socialName =
    primarySocial?.label?.trim() || primarySocial?.platform?.trim() || "";

  const contactHref = primarySocial
    ? contactUrl(
        primarySocial.url,
        "Hi! I saw your shop and I have a question.",
      )
    : null;

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────
          Proof first, product second — the inversion this version is built on.

          A shop nobody has heard of, asking a stranger to send money outside
          any platform's protection, has exactly one problem, and it is not
          that the visitor cannot find the stock. It is that they do not believe
          the shop is real. So the first thing on the page is the number of
          people who already went through it, and the first thing they read
          after that is those people talking. The account for sale comes next,
          once there is a reason to care. */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div
          aria-hidden="true"
          className="brand-wash pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden="true"
          className="plate pointer-events-none absolute inset-0"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
          <div className="flex max-w-3xl flex-col items-start gap-6">
            <h1 className="rise display text-[length:var(--display-1)] text-ink">
              {SHOP.accountsSold} accounts handed over.
              {/* The second line is the whole argument of the page, so it stays
                  inside the headline rather than becoming a subtitle under it —
                  but a step down in size. Set at the same scale it ran four
                  lines deep and pushed the quotes, which are the actual proof,
                  below the fold on a laptop. */}
              <span className="mt-2 block text-[length:var(--display-2)] text-accent-display">
                Here is what they said.
              </span>
            </h1>

            <p
              className="rise max-w-[58ch] text-[length:var(--text-md)] leading-relaxed text-ink-2 sm:text-[length:var(--text-lg)]"
              style={{ animationDelay: "80ms" }}
            >
              Mobile Legends accounts, every one listed with its full screenshot
              set and checked before a peso moves. We handle the handover with
              you personally, start to finish.
            </p>
          </div>

          {heroVouches.length > 0 && (
            <ul
              className="rise mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-4xl"
              style={{ animationDelay: "160ms" }}
            >
              {heroVouches.map((vouch) => (
                <li key={`${vouch.name}-${vouch.date}`} className="flex">
                  <VouchCard vouch={vouch} className="w-full" />
                </li>
              ))}
            </ul>
          )}

          <div
            className="rise mt-10 flex flex-col gap-2.5 sm:flex-row sm:items-center"
            style={{ animationDelay: "240ms" }}
          >
            <Link href="/accounts" className="sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto sm:px-6">
                Browse accounts
              </Button>
            </Link>

            {contactHref && (
              <a
                href={contactHref}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:w-auto"
              >
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto sm:px-6"
                >
                  Message us on {socialName || "social media"}
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Credentials ───────────────────────────────────────────────────── */}
      <section
        aria-label="What every listing comes with"
        className="border-b border-[var(--border)] bg-surface"
      >
        <ul className="mx-auto grid w-full max-w-6xl grid-cols-1 px-4 sm:px-6 lg:grid-cols-3">
          {CREDENTIALS.map((credential) => (
            <li
              key={credential}
              className={[
                "flex items-center gap-2.5 border-[var(--border)] py-4",
                "text-[length:var(--text-sm)] font-medium text-ink",
                "border-t first:border-t-0",
                "lg:border-t-0 lg:border-l lg:pl-5 lg:first:border-l-0 lg:first:pl-0",
              ].join(" ")}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="size-4 shrink-0 text-accent-ink"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 8.5 6 12l7.5-8" />
              </svg>
              {credential}
            </li>
          ))}
        </ul>
      </section>

      {/* ── The stock ──────────────────────────────────────────────────────
          Second, not first. The lead listing gets the lot card; anything else
          follows in the grid. */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="display text-[length:var(--display-2)] text-ink">
              In stock now
            </h2>
            <p className="text-[length:var(--text-md)] text-ink-2">
              {catalogue.available.length === 0
                ? "Everything is sold at the moment."
                : catalogue.available.length === 1
                  ? "One account, available today."
                  : `${catalogue.available.length} accounts, available today.`}
            </p>
          </div>

          {catalogue.available.length > 0 && (
            <Link
              href="/accounts"
              className="shrink-0 pb-1 text-[length:var(--text-sm)] font-medium text-accent-ink underline-offset-4 hover:underline"
            >
              See all →
            </Link>
          )}
        </div>

        {lead ? (
          <div className="flex flex-col gap-6">
            <div className="w-full max-w-[34rem]">
              <FeaturedListing account={lead} />
            </div>

            {rest.length > 0 && (
              <AccountGrid accounts={rest} highlightReference />
            )}
          </div>
        ) : (
          /* No stock is a real state, and the honest version of it is an
             invitation to ask — not an empty frame. */
          <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] bg-surface p-8 sm:p-10">
            <p className="display text-[length:var(--display-3)] text-ink">
              Everything is sold right now.
            </p>
            <p className="mt-2 max-w-[46ch] text-[length:var(--text-md)] leading-relaxed text-ink-2">
              New accounts are listed regularly. Message us with what you are
              looking for — rank, skins, budget — and we will tell you when it
              arrives.
            </p>

            {contactHref && (
              <a
                href={contactHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block"
              >
                <Button variant="secondary">
                  Tell us what you want on {socialName || "social media"}
                </Button>
              </a>
            )}
          </div>
        )}
      </section>

      {/* ── How buying works ───────────────────────────────────────────────
          Numbered because this genuinely is a sequence and the order is the
          information: nothing is paid before step three. */}
      <section className="border-y border-[var(--border)] bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="display max-w-xl text-[length:var(--display-2)] text-ink">
            How buying works
          </h2>

          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="display tabular text-[length:var(--display-3)] text-accent-ink">
                    {index + 1}
                  </span>
                  {/* The rule reads as a track the steps sit on, which is what
                      makes the row a sequence at a glance rather than three
                      unrelated columns. */}
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-[var(--border)]"
                  />
                </div>

                <h3 className="text-[length:var(--text-lg)] font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="max-w-[46ch] text-[length:var(--text-base)] leading-relaxed text-ink-2">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <VouchWall vouches={wallVouches} />

      {/* ── Selling ────────────────────────────────────────────────────────
          The one place the deep oxblood is used as a full field rather than as
          an accent. It closes the page on brand colour and gives the second
          audience — sellers — a hard edge to land on instead of another quiet
          section. */}
      <section className="border-t border-[var(--accent-border)] bg-accent-fill text-on-accent-fill">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="display text-[length:var(--display-2)] text-on-accent-fill">
              Selling instead?
            </h2>
            <p className="max-w-[52ch] text-[length:var(--text-md)] leading-relaxed text-on-accent-fill/80">
              Send us your account&apos;s details and screenshots. We value it,
              list it properly, and deal with the buyer — you keep the account
              until the handover.
            </p>
          </div>

          <Link href="/sell" className="shrink-0">
            <Button
              variant="secondary"
              className="w-full border-transparent bg-surface text-ink hover:bg-surface-3 sm:w-auto sm:px-6"
            >
              How selling works
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
