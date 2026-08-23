# PRODUCT.md

## What this is

A showcase marketplace for Mobile Legends: Bang Bang accounts. It lists accounts
that are for sale and hands the conversation off to social media. It does not
process payments, hold funds, or complete transactions.

## Register

`product` for `/admin/*` — design serves the task.
`brand` for the public marketplace — that surface sells, and is built in Phase 5+.

This file's design direction covers the admin. The public side inherits the same
tokens but is allowed a louder voice.

## Platform

`web`

## Who uses it

**The operator (one person).** Signs in to `/admin`, catalogues accounts,
uploads screenshots, moves listings between available / reserved / sold. Works
in sessions of 15–30 minutes at a desk, in a lit room, entering repetitive
structured data. Needs to read prices, ranks and status at a glance without
fatigue. This is a back office, not a showpiece.

**The buyer (public, Phase 5).** Arrives from a social media post, usually on a
phone. Skims listings, opens one, studies the screenshots, decides whether to
message. Impatient, image-led, on mobile data.

**The seller (public, Phase 6).** Wants to know how selling works and who to
contact. Reads one page, then leaves for social media.

## What it must get right

1. **Trust.** Money moves off-platform on the strength of what this site shows.
   It has to look like a business, not a fan page or a scam.
2. **Legibility of dense data.** Price, rank, collection level, skin count and
   status are the whole product. They must be scannable in a table.
3. **Screenshots.** The gallery is the evidence. Images must be fast and sharp.
4. **Mobile.** Buyers come from social media. Phase 5 is mobile-first.

## Non-goals

No payments. No checkout. No cart. No buyer accounts. No seller registration,
seller login, seller dashboard, or seller submission form. No chat. No reviews
or ratings. No complex analytics.

## Constraints

- Supabase Auth + Row Level Security only. The browser holds the publishable
  key. There is no service-role key anywhere in this codebase and there must
  never be one — see `.env.example`.
- Ranks and collection levels are read from Supabase, never hardcoded.
- Social URLs come from the `social_links` table, never hardcoded per component.
- Built in approved phases. Phase 4 is the admin dashboard only.
