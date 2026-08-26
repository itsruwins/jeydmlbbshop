import type { Metadata } from "next";
import Link from "next/link";

import { Faq } from "@/components/home/Faq";
import { HeroShowcase } from "@/components/home/HeroShowcase";
import { StockShelf } from "@/components/home/StockShelf";
import { PaymentMarks } from "@/components/shared/PaymentMarks";
import { VouchCard } from "@/components/home/VouchWall";
import { VOUCHES } from "@/components/home/vouches";
import { ContactButton } from "@/components/shared/ContactButton";
import { FollowLinks } from "@/components/shared/FollowLinks";
import { Button } from "@/components/ui/Button";
import { getPublicAccounts } from "@/functions/accounts/getPublicAccounts";
import { getSocialLinks } from "@/functions/socialLinks/getSocialLinks";
import { SHOP } from "@/lib/constants/shop";
import { GENERAL_MESSAGE } from "@/lib/utils/contactMessage";
import { contactLinks, followLinks } from "@/lib/utils/socialLinks";

/**
 * Cached and regenerated at most every five minutes.
 *
 * The page reads listings anonymously, which means Next can — and without this
 * line, does — prerender it once at build time and serve that forever. The
 * storefront would then be frozen at whatever stock existed when the site was
 * deployed. Five minutes is the ceiling, not the usual case: the account
 * mutations call `revalidatePath("/")`, so an admin edit shows up straight away.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: `${SHOP.name} — Mobile Legends accounts, shown in full`,
  },
  description:
    "Mobile Legends: Bang Bang accounts listed with their full screenshot set, real rank, collection level and skin count. Message us and we arrange the handover directly.",
};

/**
 * The storefront.
 *
 * ## Why it is shaped like this
 *
 * Every competing marketplace — PlayerAuctions, G2G, PlayHub, GameMarket,
 * Zeusx — opens with a paragraph of prose and shows nothing for sale until you
 * click into a category. Their trust signals are all borrowed numbers: seller
 * ratings, review counts, inventory totals.
 *
 * This shop cannot win on inventory and should not try. What it has instead is
 * a small, completely photographed catalogue and one person answering the
 * messages — so the page leads with the goods: a real listing at real size in
 * the first fold, live from the database.
 *
 * ## Why each section looks different
 *
 * The previous version was one centred column of heading → paragraph → row of
 * cards, four times over. That uniform cadence is what made it read as
 * generated, more than any individual choice inside it. Every fold here has its
 * own spatial idea instead: an asymmetric split, a shelf that bleeds off the
 * page, an inverted band, a moving strip, a two-column index. The rhythm
 * changing as you scroll is the point.
 */

const STEPS = [
  {
    title: "Open a listing",
    body: "Full screenshot set, rank, collection level, skin count, server. Read all of it before you say a word to us.",
  },
  {
    title: "Message us",
    body: "The button copies a message with the reference already in it. Ask anything — nothing is reserved and nothing is rushed.",
  },
  {
    title: "Do the handover",
    body: "We go through the email and binding change together, and stay with it until you have signed in yourself.",
  },
];

export default async function HomePage() {
  const [catalogue, socials] = await Promise.all([
    getPublicAccounts({ sort: "newest" }),
    getSocialLinks(),
  ]);

  // The first *contact* link, which is the one carrying conversations. A feed
  // is not somewhere a buyer can be answered, so it can never lead here.
  const primarySocial = contactLinks(socials)[0];
  const follow = followLinks(socials);
  const socialName =
    primarySocial?.label?.trim() || primarySocial?.platform?.trim() || "";

  const inStock = catalogue.available.length;

  return (
    <>
      {/* ── 1. The goods ───────────────────────────────────────────────────
          Asymmetric split: the argument on the left, a live listing on the
          right at the size a listing deserves. */}
      <section className="wedge relative overflow-hidden border-b border-[var(--border)]">
        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-14 lg:pb-24 lg:pt-24">
          <div className="enter-stagger flex max-w-2xl flex-col items-start gap-6">
            <h1 className="display text-[length:var(--display-1)] text-ink">
              Every account,
              <span className="block text-accent-display">shown in full.</span>
            </h1>

            <p className="max-w-[54ch] text-[length:var(--text-md)] leading-relaxed text-ink-2 sm:text-[length:var(--text-lg)]">
              Not a marketplace of strangers. One shop, {SHOP.accountsSold}{" "}
              accounts handed over, and every listing photographed end to end
              before it goes up.
            </p>

            <div className="flex w-full flex-col gap-2.5 pt-1 sm:w-auto sm:flex-row sm:items-center">
              <Link href="/accounts" className="sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto sm:px-6">
                  {inStock > 0
                    ? `Browse ${inStock} account${inStock === 1 ? "" : "s"}`
                    : "Browse accounts"}
                </Button>
              </Link>

              {primarySocial && (
                <ContactButton
                  link={primarySocial}
                  message={GENERAL_MESSAGE}
                  label={`Message us on ${socialName || "social media"}`}
                  className="sm:w-auto"
                />
              )}

              {/* The feeds, trailing the two buttons rather than pushed to the
                  far edge of the column. Everything else in this column is
                  left-aligned, so an element hard against the right margin had
                  nothing to line up with and read as adrift.

                  The caption is two words and it is load-bearing: bare icons
                  immediately after a button reading "Message us on Facebook"
                  invite exactly the assumption the contact/follow split exists
                  to prevent — that a buyer can send their reference to a
                  TikTok profile. "Also on" says these are somewhere we are,
                  not somewhere to write to.

                  The rule only appears once the row is horizontal. Stacked on
                  a phone it would divide nothing. */}
              {follow.length > 0 && (
                <div className="mt-1.5 flex items-center gap-3 sm:mt-0 sm:pl-1">
                  <span
                    aria-hidden="true"
                    className="hidden h-6 w-px bg-[var(--border)] sm:block"
                  />
                  <span className="text-[length:var(--text-sm)] text-ink-3">
                    Also on
                  </span>
                  <FollowLinks links={follow} variant="solid" />
                </div>
              )}
            </div>

            {/* Three facts, set against a rule rather than in cards. The page
                has enough rounded rectangles on it already. */}
            <dl className="mt-2 flex w-full flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-[var(--border)] pt-5">
              {[
                [SHOP.accountsSold, "accounts sold"],
                ["< 1 hr", "reply time"],
                ["Every listing", "fully photographed"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="sr-only">{label}</dt>
                  <dd className="display tabular text-[length:var(--display-3)] text-ink">
                    {value}
                  </dd>
                  <dd className="text-[length:var(--text-sm)] text-ink-3">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="drift w-full max-w-[27rem] lg:max-w-none">
            {catalogue.available.length > 0 ? (
              <HeroShowcase accounts={catalogue.available} />
            ) : (
              <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] bg-surface p-8">
                <p className="display text-[length:var(--display-3)] text-ink">
                  Everything is sold right now.
                </p>
                <p className="mt-2 max-w-[38ch] text-[length:var(--text-sm)] leading-relaxed text-ink-2">
                  New accounts are listed regularly. Tell us what you are
                  looking for and we will let you know when it arrives.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. The shelf ───────────────────────────────────────────────────
          Full-bleed, and the rail runs off the right edge on purpose. */}
      {catalogue.available.length > 0 && (
        <section className="reveal border-b border-[var(--border)] bg-surface-2 py-14 sm:py-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6">
            <div className="flex items-end justify-between gap-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="display text-[length:var(--display-2)] text-ink">
                  On the shelf
                </h2>
                <p className="text-[length:var(--text-md)] text-ink-2">
                  {inStock} available now.
                </p>
              </div>

              <Link
                href="/accounts"
                className="shrink-0 pb-1 text-[length:var(--text-sm)] font-medium text-accent-ink underline-offset-4 hover:underline"
              >
                All accounts →
              </Link>
            </div>

            <StockShelf accounts={catalogue.available} />
          </div>
        </section>
      )}

      {/* ── The payment line ───────────────────────────────────────────────
          One line, not a fold. Every section on this page owns a spatial idea
          and this deliberately owns none — it is a rule with content on it,
          sitting in the seam between the shelf and the process so it does not
          interrupt the rhythm the way a seventh section would.

          It is placed here rather than anywhere else for two reasons. The
          heading directly beneath it reads "Nothing is paid until step three",
          and a row of banks is the setup for that line rather than a
          distraction from it. And it is two folds clear of the vouch strip,
          which is the only other thing on the page that moves — put them on
          one screen and both stop reading as information.

          The caption holds still while the marks travel past it, so the label
          is never off-screen from the thing it labels. */}
      <section className="border-b border-[var(--border)] bg-bg">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
          <PaymentMarks variant="band" />
        </div>
      </section>

      {/* ── 3. The process ─────────────────────────────────────────────────
          The one inverted band on the page. Numbers earn their place here
          because this genuinely is a sequence: nothing is paid before step
          three. */}
      <section className="border-b border-[var(--accent-border)] bg-accent-fill text-on-accent-fill">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="display max-w-xl text-[length:var(--display-2)] text-on-accent-fill">
            Nothing is paid until step three.
          </h2>

          <ol className="reveal-stagger mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="display tabular text-[length:var(--display-3)] text-on-accent-fill">
                    {index + 1}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-[var(--on-accent-fill)] opacity-25"
                  />
                </div>
                <h3 className="text-[length:var(--text-lg)] font-semibold text-on-accent-fill">
                  {step.title}
                </h3>
                <p className="max-w-[42ch] text-[length:var(--text-base)] leading-relaxed text-on-accent-fill/80">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 4. The proof ───────────────────────────────────────────────────
          A moving strip rather than a wall of cards. Eight comments in a grid
          is a wall to read; eight drifting past is something you glance at and
          believe. */}
      {VOUCHES.length > 0 && (
        <section className="overflow-hidden border-b border-[var(--border)] bg-bg py-14 sm:py-16">
          <div className="mx-auto mb-8 w-full max-w-6xl px-4 sm:px-6">
            <h2 className="display max-w-xl text-[length:var(--display-2)] text-ink">
              What buyers said afterwards
            </h2>
            <p className="mt-2 max-w-[54ch] text-[length:var(--text-md)] text-ink-2">
              Comments from our Facebook post, by people who already went
              through the handover.
            </p>
          </div>

          <div className="marquee relative">
            {/* The strip fades into the page at both ends rather than being cut
                off by the viewport edge. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--bg)] to-transparent sm:w-28"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent sm:w-28"
            />

            <ul className="marquee-track flex w-max gap-5 pl-4 sm:pl-6">
              {/* Rendered twice so the loop has somewhere to go. The second pass
                  is hidden from screen readers, which would otherwise read every
                  comment on the page a second time. */}
              {[0, 1].map((pass) => (
                <li key={pass} aria-hidden={pass === 1} className="contents">
                  {VOUCHES.map((vouch) => (
                    <div
                      key={`${pass}-${vouch.id}`}
                      className="w-[19rem] shrink-0 sm:w-[22rem]"
                    >
                      <VouchCard vouch={vouch} />
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </div>

          {SHOP.vouchPostUrl && (
            <p className="mx-auto mt-8 w-full max-w-6xl px-4 text-[length:var(--text-sm)] text-ink-3 sm:px-6">
              All of these are from{" "}
              <a
                href={SHOP.vouchPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-ink underline underline-offset-2 hover:no-underline"
              >
                our feedback post on Facebook
              </a>
              , posted with each person&apos;s permission.
            </p>
          )}
        </section>
      )}

      {/* ── 5. The questions ───────────────────────────────────────────────
          A heading beside a scrolling index. None of the marketplaces answer
          these on the page; they bury them in a help centre. */}
      <section className="border-b border-[var(--border)] bg-surface-2">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
          {/* Not pinned. A heading that holds still while its own questions
              scroll past reads as the page having come loose, and the section
              is short enough that the heading is never far away. */}
          <div>
            <h2 className="display text-[length:var(--display-2)] text-ink">
              Before you ask
            </h2>
            <p className="mt-3 max-w-[36ch] text-[length:var(--text-md)] leading-relaxed text-ink-2">
              The things people message about most. If yours is not here, ask —
              it is not a bother.
            </p>
          </div>

          <Faq />
        </div>
      </section>

      {/* ── 6. Selling ─────────────────────────────────────────────────────
          The other audience, given the last word rather than a footnote. */}
      <section className="bg-bg">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="display max-w-[16ch] text-[length:var(--display-2)] text-ink">
              Got an account to sell?
            </h2>
            <p className="max-w-[52ch] text-[length:var(--text-md)] leading-relaxed text-ink-2">
              Send the details and screenshots. We value it, list it properly
              and deal with the buyer — you keep the account until the handover.
            </p>
          </div>

          <Link href="/sell" className="shrink-0">
            <Button variant="primary" className="w-full sm:w-auto sm:px-6">
              How selling works
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
