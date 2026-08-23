# Tests

End-to-end tests, run in Chromium against a real production build.

```bash
npm test           # run everything
npm run test:ui    # watch mode, step through a failure
npm run test:report
```

## What runs without setup

`security`, `public`, `responsive` and `accessibility` need nothing beyond
`.env.local`. They cover the buyer's whole path, every filter, both 404 cases,
three breakpoints, and the security boundary.

## What needs credentials

The admin specs need a session and **skip themselves** when
`TEST_ADMIN_EMAIL` / `TEST_ADMIN_PASSWORD` are unset, so the suite stays green
for anyone who has not set them up. Add them to `.env.local` — which is
gitignored — and run again:

```bash
TEST_ADMIN_EMAIL=you@example.com TEST_ADMIN_PASSWORD=... npm test
```

## These tests write to the real database

There is no separate test project. Every listing the admin specs create is
prefixed `ZZTEST-` and deleted in the same test.

If a run is interrupted, leftovers are easy to find:

```sql
select account_reference, status from accounts where account_reference like 'ZZTEST-%';
```

They are created `hidden` and only published briefly, so an interrupted run is
very unlikely to leave anything on the public catalogue.

## Why a production build, not `next dev`

`playwright.config.ts` runs `next build && next start`. Two behaviours these
tests assert differ under the dev server — the 404 status on a missing listing,
and the revalidate windows on cached pages — and both have already broken once.
Testing against dev would give false confidence in exactly those places.
