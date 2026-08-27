import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountGallery } from "@/components/accounts/AccountGallery";
import { AttachedPriceTag } from "@/components/accounts/AttachedPriceTag";
import { BeforeYouMessage } from "@/components/accounts/BeforeYouMessage";
import { ContactCTA } from "@/components/accounts/ContactCTA";
import { InstallmentPanel } from "@/components/accounts/InstallmentPanel";
import { ListingCard } from "@/components/accounts/ListingCard";
import {
  CrownIcon,
  GemIcon,
  HeroIcon,
  SparkIcon,
} from "@/components/home/specIcons";
import { PaymentMarks } from "@/components/shared/PaymentMarks";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAccountByReference } from "@/functions/accounts/getAccountByReference";
import { getPublicAccounts } from "@/functions/accounts/getPublicAccounts";
import { getSocialLinks } from "@/functions/socialLinks/getSocialLinks";
import { imagePublicUrl } from "@/lib/utils/imagePublicUrl";
import { formatCount, formatPrice } from "@/lib/utils/format";
import { installmentPlans, offersInstallment } from "@/lib/utils/installment";

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

/**
 * One listing, at length.
 *
 * ## The page is two jobs, not two columns
 *
 * Everything on the left is *evidence* — the screenshots, the facts a buyer
 * compares accounts on, whatever the seller wrote about it. Everything
 * on the right is *the offer* — what it costs, whether it is still going, and
 * the one action the site has. Splitting on that line rather than on "wide
 * thing / narrow thing" is what makes the right column readable as one object
 * instead of a leftover strip.
 *
 * The rail was sticky and is not any more. Pinning it meant the card slid
 * upward against the evidence for the whole length of the scroll, and a panel
 * that moves while the thing beside it holds still reads as the page coming
 * apart rather than as the offer staying to hand. It now sits where it was
 * put, and the buyer reaches it by scrolling back — which is what they do with
 * every other page they use.
 *
 * The DOM order is gallery → offer → evidence, which is also the order a phone
 * shows them in. Grid placement moves the evidence back under the gallery on
 * `lg` without a second copy of anything, so the phone never gets the desktop
 * compromise of scrolling past the whole spec panel to reach the price.
 *
 * ## Where the identity and the price live
 *
 * Neither is a line of text in the rail any more.
 *
 * The reference is a chip on the screenshot itself, because it is a label for
 * that picture: a buyer who screenshots the frame or shares the link needs the
 * code to travel with the image rather than sit in a column that gets cropped
 * out of both. It is still the page's only `<h1>` — see `AccountGallery`.
 *
 * The price is said twice, deliberately, and only one of them is the tag.
 *
 * The tag lies across the bottom edge of the gallery frame — the same edge, on
 * the same punched paper, as the tag on the listing card the buyer clicked to
 * get here. That is the whole reason it is on the artwork: a tag reads as an
 * object lying on a surface only when there are two surfaces for it to cross,
 * and the offer card's right border had nothing behind it to cross onto. See
 * `AttachedPriceTag`.
 *
 * The second copy is inside the message the buyer sends — "…account J4
 * (₱3,500)" — which is the one that has to be right, because it is the one
 * that leaves the page. There is no third copy set as a line of type in the
 * rail; see `ContactCTA` for why it was taken out.
 *
 * ## What was added, and why it was missing
 *
 * `description` was on every listing and shown on none of them — the seller
 * could write a note about an account and no buyer would ever see it. The
 * related shelf at the foot is the other half of that: a listing page with no
 * exit but the back button is a dead end, and the catalogue is one link
 * further away than it needs to be.
 *
 * ## What the spec panel stopped saying
 *
 * `account_level` came out because the admin form no longer collects it: every
 * listing rendered it as an em dash, which is a field admitting it has nothing
 * to say. The screenshot count came out because the screenshots are directly
 * above it — counting things the buyer can see and swipe is furniture.
 *
 * The listing date went with them. On a shop this size a date three weeks old
 * is not provenance, it is "nobody wanted this", and it was doing that work on
 * every listing that had not sold in a fortnight.
 *
 * That left `server` alone under its own heading and its own bordered panel,
 * which is a section for one line of text. It is now the last row of the spec
 * panel, on a quieter ground so it reads as reference rather than as a fifth
 * thing being sold.
 */
export default async function AccountDetailPage({
  params,
}: PageProps<"/accounts/[reference]">) {
  const { reference } = await params;

  const [account, socialLinks, catalogue] = await Promise.all([
    getAccountByReference(decodeURIComponent(reference)),
    getSocialLinks(),
    getPublicAccounts({ sort: "newest" }),
  ]);

  // Not found and not public are the same answer, so a hidden draft cannot be
  // confirmed to exist by probing references.
  if (!account) notFound();

  /* The facts a buyer compares accounts on, each behind the mark it carries on
     the card.

     Rows, not tiles. Two of these values are words and two are two-digit
     numbers, and a grid of equal tiles has to stand as tall as the longest of
     them: "Mythical Immortal" wraps to two lines and drags the skin and hero
     counts into boxes several times the size of the figure inside. A row is
     paid for by its own content — a long rank name and a two-digit count cost
     the same height — and the labels share one left edge while the values
     share one right, which is the alignment a buyer comparing two tabs needs.

     `numeric` is a type decision, not a data one. The counts are the figures
     accounts are actually ranked against, so they keep the large semibold; the
     names are read once and set a step down, which is what stops them from
     wrapping in the first place.

     An absent value drops its row rather than rendering an em dash. The dash
     existed to keep a four-cell grid even; nothing here needs keeping even,
     and a listing with no collection level is better described by three facts
     than by four with one of them shrugging. */
  const specs = [
    {
      icon: <CrownIcon />,
      label: "Rank",
      value: account.rank?.name?.trim() || null,
      numeric: false,
    },
    {
      icon: <GemIcon />,
      label: "Collection",
      value: account.collection_level?.name?.trim() || null,
      numeric: false,
    },
    {
      icon: <SparkIcon />,
      label: "Skins",
      value:
        account.skin_count === null ? null : formatCount(account.skin_count),
      numeric: true,
    },
    {
      icon: <HeroIcon />,
      label: "Heroes",
      value:
        account.hero_count === null ? null : formatCount(account.hero_count),
      numeric: true,
    },
  ].filter((spec) => spec.value !== null);

  /* The one detail that survived. Stored as the seller types it — "1579738860
     (115893)", the account id with the server in parentheses — so it is set in
     mono and left whole rather than parsed into two fields the admin never
     entered separately. */
  const gameId = account.server?.trim() || null;

  /* Asked once and used everywhere, because the offer decides three things:
     whether the panel is drawn at all, and — see the payment marks below —
     where the "we accept" strip is drawn and how wide it runs. */
  const hasInstallment = offersInstallment(account);
  const plans = installmentPlans(account);

  /* Which of the strip's two homes it takes, on `lg` and up.

     It is down here at all to absorb the surplus the rail leaves under the
     evidence — but there is only surplus while the rail is the taller column,
     and the rail is only taller while the installment panel carries more than
     one row. Offer a single downpayment and the two columns already end within
     a few pixels of each other: a strip held to the evidence width then
     absorbs nothing and instead hangs off the bottom-left corner with the
     whole width of the rail as empty page beside it.

     So on that listing it stops being a column and becomes a rule across the
     page — full width, under both — which is a shape that reads as the foot of
     the listing rather than as a stray fourth panel in the left-hand stack.

     Counting rows is a proxy for "is the rail taller", and it is exact in the
     only case that matters here: the columns end level, so there is nothing to
     fill and nothing lost by spanning. */
  const marksFillTheColumn = plans.length > 1;
  const marksSpanThePage = plans.length === 1;

  // Available only, and never this listing. Someone reading a sold account is
  // already being told, in the panel above, that there is other stock — this
  // is that sentence with the stock actually in it.
  const related = catalogue.available
    .filter((other) => other.id !== account.id)
    .slice(0, 3);

  return (
    <div className="shell px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-7">
      {/* A trail rather than a single back link. "← All accounts" answered
          where the button goes and not where the page sits; a buyer who
          arrived from a shared link has no history to go back to and needs
          both routes out. */}
      <nav aria-label="Breadcrumb" className="mb-5 sm:mb-7">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[length:var(--text-sm)] text-ink-3">
          <li>
            <Link
              href="/"
              className="underline-offset-2 transition-colors duration-[var(--dur-fast)] hover:text-ink-2 hover:underline"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-ink-3/50">
            /
          </li>
          <li>
            <Link
              href="/accounts"
              className="underline-offset-2 transition-colors duration-[var(--dur-fast)] hover:text-ink-2 hover:underline"
            >
              Browse accounts
            </Link>
          </li>
          <li aria-hidden="true" className="text-ink-3/50">
            /
          </li>
          <li aria-current="page" className="font-mono text-ink-2">
            {account.account_reference}
          </li>
        </ol>
      </nav>

      {/* `grid-rows-[auto_1fr]` is load-bearing, not tidiness. The rail spans
          both rows, and when it stands taller than the gallery and the
          evidence together — which is exactly what the installment panel does
          — a grid with two `auto` rows splits the surplus between them. Row
          one grows, the gallery does not, and the difference comes out as dead
          space between the screenshots and "What you are getting": a listing
          with installment drew a gap a listing without it did not. Pinning row
          one to `auto` and letting row two take the `1fr` sends every bit of
          that surplus below the evidence, where nothing is drawn and nobody
          reads it. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-10 xl:gap-12">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <AccountGallery
            images={account.images}
            label={account.account_reference}
            /* Formatted and built here rather than inside the gallery: that is
               a client component, and `formatPrice` would drag an
               `Intl.NumberFormat` across the boundary to render one value that
               cannot change. Omitted outright when the listing has no price —
               a tag reading "—" is not a price, it is a bug with a border. */
            priceTag={
              account.price === null ? undefined : (
                <AttachedPriceTag price={formatPrice(account.price)} />
              )
            }
          />
        </div>

        {/* The offer. `self-start` keeps the card at its own height rather
            than stretched down the full two-row span, so the column ends where
            the card ends instead of drawing a panel the length of the
            evidence. It does not travel with the scroll — see the note above. */}
        <aside className="flex min-w-0 flex-col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          {/* The rail is the offer and nothing else: whether it is still going,
              and what it costs to take it. The reference used to head this
              column and has moved onto the screenshot it names — see
              `AccountGallery` — which leaves the badge as the only thing
              standing above the card, and the card as the only object in the
              column. That is the hierarchy the page always meant.

              The rank chip that once sat beside the status went the same way:
              "Mythical Immortal" is already the first row of the spec panel,
              under its own mark. Twice on one screen is once too many, and it
              was the weaker copy of the two.

              `self-start` because the rail is a column flex container: a bare
              badge stretches the full width of it and reads as a banner rather
              than a chip. */}
          <StatusBadge status={account.status} className="self-start" />

          {/* Above the contact card, because it is something a buyer needs to
              know *before* deciding to message rather than a detail to raise
              afterwards. Absent entirely on a listing that is not open for
              installment, and on one nobody can buy any more. */}
          {hasInstallment && (
            <InstallmentPanel plans={plans} />
          )}

          <ContactCTA
            reference={account.account_reference}
            price={account.price}
            status={account.status}
            socialLinks={socialLinks}
            /* The marks are in the card on a listing without installment and
               under the evidence on one with it — never both, and never
               neither. See the strip at the foot of the evidence column for
               why they move. */
            paymentMarks={hasInstallment ? undefined : <PaymentMarks />}
          />

          {/* The disclaimer and the reply-time promise, on the listing that
              has room for them.

              Room is the second reason, not the first. The rail on a listing
              without installment is one card against a column carrying the
              gallery, the thumbnails and the spec panel, and it used to run
              out roughly level with "What you are getting" — leaving the
              width of the rail as empty page beside the specs for the rest of
              the scroll. That void is what this fills, and it fills it with
              the two questions a buyer actually has with the cursor over the
              button rather than with a spacer.

              An installment listing does not get it, for both reasons at
              once. The panel above the card already closes with the same
              promise attached to the actual figures, so this would be the
              weaker second copy of a line already on screen; and that same
              panel is what makes the rail the taller column, so adding
              another block here would push the surplus back under the
              evidence — the gap this exists to close, reopened one column
              over. See `marksFillTheColumn` below for the other half of that
              balance. */}
          {!hasInstallment && <BeforeYouMessage />}
        </aside>

        {/* `justify-end` is what puts this column's last box on the same line
            as the rail's last box.

            The two columns are independent stacks and they do not end level on
            their own: the rail here is a card plus `BeforeYouMessage`, this
            one is a gallery plus a spec panel, and whichever runs longer sets
            the height of the grid. The shorter one is then stretched by the
            `1fr` row and its surplus has to be somewhere. Left at the default
            it collects *under* the last box, which is the misalignment you see
            — the spec panel stopping a few pixels short of the panel beside
            it. Sent to the top it collects in the gap below the thumbnails
            instead, and the two boxes close on one line.

            Above the gap rather than below it, because a gap above the last
            box is read as spacing and a gap below it is read as the box being
            the wrong size. It is small in practice: `BeforeYouMessage` was
            written to bring the rail out level with this column, so what is
            being moved is the remainder, not the difference.

            A listing with installment has a `mt-auto` on the marks band at the
            foot of this column, and an auto margin takes the free space before
            justification can — so that listing keeps behaving exactly as it
            did, with the marks doing this job instead. */}
        <div className="flex min-w-0 flex-col gap-8 lg:col-start-1 lg:row-start-2 lg:justify-end">
          {(specs.length > 0 || gameId) && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[length:var(--text-sm)] font-medium tracking-[0.005em] text-ink-3">
                What you are getting
              </h2>
              {/* One panel of hairline-separated rows rather than four floating
                  cards. `min-h-11` rather than symmetric padding: the rows
                  carry two type sizes, and padding alone would let the numeric
                  rows stand taller than the named ones and break the rhythm
                  the shared left edge exists to create.

                  Two columns from `sm` up. In one column across the full
                  evidence width the label sat at the far left and its value at
                  the far right with 60rem of nothing between them, which is a
                  row a reader has to track rather than read. Halving the width
                  halves the trip without going back to tiles. */}
              <dl className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface sm:grid-cols-2">
                {specs.map((spec, index) => (
                  <div
                    key={spec.label}
                    className={[
                      "flex min-h-11 items-center justify-between gap-4 border-[var(--border)] px-4 py-2",
                      // Hairlines are drawn from each cell's own position: a
                      // `divide-*` utility cannot tell a row break from a
                      // column break, and this grid has both.
                      index > 0 ? "border-t" : "",
                      index < 2 ? "sm:border-t-0" : "sm:border-t",
                      index % 2 === 1 ? "sm:border-l" : "",
                      // An odd count would leave a hole in the bottom row, so
                      // the straggler takes the width instead.
                      index === specs.length - 1 && specs.length % 2 === 1
                        ? "sm:col-span-2"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <dt className="flex items-center gap-2 text-[length:var(--text-sm)] text-ink-3">
                      {spec.icon}
                      {spec.label}
                    </dt>
                    <dd
                      className={
                        spec.numeric
                          ? "tabular text-right text-[length:var(--text-lg)] font-semibold leading-none text-ink"
                          : "text-right text-[length:var(--text-base)] font-medium leading-snug text-ink"
                      }
                    >
                      {spec.value}
                    </dd>
                  </div>
                ))}

                {gameId && (
                  /* Sunk onto `--surface-2` — a shade down in the dark theme, a
                     shade up in the light one — so the panel ends on a footing
                     rather than on a fifth claim about the account. No
                     `tabular`: the value is already mono, and tabular figures
                     widen the parentheses around the server into gaps. */
                  <div className="flex min-h-11 items-center justify-between gap-4 border-t border-[var(--border)] bg-surface-2 px-4 py-2 sm:col-span-2">
                    <dt className="text-[length:var(--text-sm)] text-ink-3">
                      Game ID
                    </dt>
                    <dd className="break-all text-right font-mono text-[length:var(--text-sm)] text-ink-2">
                      {gameId}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {account.description?.trim() && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[length:var(--text-sm)] font-medium tracking-[0.005em] text-ink-3">
                About this account
              </h2>
              {/* `pre-line`, not `pre`: the seller writes these in a textarea
                  and the line breaks they put in are meaning, but the wrapping
                  is the browser's job. */}
              <p className="whitespace-pre-line rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface p-4 leading-relaxed text-ink-2">
                {account.description.trim()}
              </p>
            </section>
          )}

          {/* "We accept", moved out of the contact card — but only on a
              listing that offers installment.

              The installment panel is tall, and it makes the rail taller than
              the evidence beside it. The surplus has to go somewhere; the grid
              above puts it at the foot of this column, and an empty foot is
              exactly the gap that was there before, moved down a screen. The
              marks fill it, and taking them out of the rail shortens the
              surplus at the same time — the two columns meet in the middle
              rather than one being padded to the other.

              `mt-auto` is what makes it land: the row is pushed to the bottom
              of the stretched grid row, so the strip's baseline is the rail's
              baseline and the two columns end on one line. Where the evidence
              is already the taller column there is no free space to absorb and
              the margin collapses to the ordinary `gap-8`.

              `band` rather than the card variant because this column is wide.
              The 13px marks are sized for a 27rem rail; across the full
              evidence width they read as a row of specks, and the band's
              pinned caption keeps the label beside the thing it labels.

              The hairline is the same one the card variant draws, for the same
              reason: without a stated edge the strip floats under the spec
              panel as a fourth unrelated object.

              A listing with no installment keeps the marks in the card, next
              to the button, which is where the question they answer gets
              asked. Nothing is rendered twice — see `paymentMarks` above. */}
          {marksFillTheColumn && (
            <PaymentMarks
              variant="band"
              className="border-t border-[var(--border)] pt-6 lg:mt-auto"
            />
          )}
        </div>

        {/* The same strip, spanning instead of filling — see
            `marksSpanThePage` for when and why.

            A grid child rather than the last thing in the evidence column,
            because a cell cannot be widened from inside it: crossing into the
            rail's column means being placed in a row of its own, under both.
            `row-start-3` is that row, and it exists only on this branch.

            Below `lg` there is one column and the two branches are the same
            element in the same place, so the mobile page is untouched either
            way. The hairline is what carries the difference on desktop: held
            to the evidence it underlines a column, run across the page it
            closes the listing — which is the same job the rule above "Also in
            stock" is doing a screen further down. */}
        {marksSpanThePage && (
          <PaymentMarks
            variant="band"
            className="border-t border-[var(--border)] pt-6 lg:col-span-2 lg:col-start-1 lg:row-start-3"
          />
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-14 flex flex-col gap-5 border-t border-[var(--border)] pt-10 sm:mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="display text-[length:var(--display-3)] text-ink">
              Also in stock
            </h2>
            <Link
              href="/accounts"
              className="group/all text-[length:var(--text-sm)] text-ink-3 transition-colors duration-[var(--dur-fast)] hover:text-ink"
            >
              Browse all accounts
              <span
                aria-hidden="true"
                className="ml-1.5 inline-block transition-transform duration-[var(--dur)] ease-[var(--ease-out)] motion-safe:group-hover/all:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((other) => (
              <li key={other.id} className="flex">
                <ListingCard
                  account={other}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 22rem"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
