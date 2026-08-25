# Live Supabase schema — reference documentation

**This folder is documentation, not migrations. Nothing here is executed.**

The database was created in Phases 1–3 directly in Supabase. This file records
what is actually there, verified by introspection against the live project, so
that application code has a written contract to build against.

If you change the database, update this file in the same commit.

## Verification method

Columns were confirmed one at a time through the PostgREST REST API using the
publishable (anon) key: a `select=<column>` that returns `200` proves the column
exists, `400` proves it does not. Relationships were confirmed by resolving
PostgREST embeds. Row counts came from `Prefer: count=exact`.

Types below are inferred from observed values and from the project
specification. Nullability and CHECK constraints could not be read with a
publishable key, so the application treats every optional field as nullable and
re-validates every vocabulary in Zod rather than trusting the database to
reject bad input.

## Tables

### `accounts`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `account_reference` | `text` | Human-facing code, unique. App generates `J1` style values |
| `price` | `numeric` | Philippine pesos |
| `rank_id` | `uuid` | → `ranks.id` |
| `collection_level_id` | `uuid` | → `collection_levels.id` |
| `server` | `text` | Free text. Holds the in-game ID and server together, e.g. `123456789 (2001)`; surfaced as "ID & Server" |
| `account_level` | `integer` | Legacy. The admin form no longer collects one and no mutation writes the column |
| `hero_count` | `integer` | |
| `skin_count` | `integer` | |
| `description` | `text` | Legacy. No longer collected or written; the listing page no longer renders it |
| `status` | `text` | `available` \| `reserved` \| `sold` \| `hidden` |
| `is_featured` | `boolean` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

`status` is **`text` with a CHECK constraint, not a PostgreSQL enum** — a filter
on an unknown value returns `200 []` rather than the `22P02` cast error an enum
would raise. The four-value vocabulary is therefore enforced in
`schemas/accountSchema.ts` on the way in.

`title` was **dropped** from the table on 24 Aug 2026, after the admin form
stopped collecting one. Nothing in the app selects or writes it any more.

Confirmed absent (they belong to the archived design, not this one):
`reference`, `price_php`, `rank_slug`, `collection_slug`, `published_at`,
`transfer`, `features`, `signature_hero`, `peak_mythic_points`,
`compare_at_php`, `search_blob`, `slug`.

### `account_images`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `account_id` | `uuid` | → `accounts.id` |
| `storage_path` | `text` | Path inside the `account-images` bucket |
| `alt_text` | `text` | |
| `display_order` | `integer` | 0-based gallery position |
| `is_cover` | `boolean` | At most one true per account — enforced by the app |
| `created_at` | `timestamptz` | |

Confirmed absent: `sort_order`, `is_primary`, `kind`.

### `profiles`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | → `auth.users.id` |
| `email` | `text` | |
| `role` | `text` | `admin` grants write access. Anything else grants none |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

Not readable by anonymous requests — RLS restricts it, as intended.

### `ranks` — 7 rows

| Column | Type |
| --- | --- |
| `id` | `uuid` |
| `name` | `text` |
| `sort_order` | `smallint` |
| `is_active` | `boolean` |
| `created_at` | `timestamptz` |

`Grandmaster` (1), `Epic` (2), `Legend` (3), `Mythic` (4), `Mythical Honor` (5),
`Mythical Glory` (6), `Mythical Immortal` (7).

Warrior, Elite and Master are deliberately not present.

### `collection_levels` — 45 rows

| Column | Type |
| --- | --- |
| `id` | `uuid` |
| `name` | `text` |
| `category` | `text` |
| `level` | `text` — `V` \| `IV` \| `III` \| `II` \| `I` |
| `sort_order` | `smallint` |

`sort_order` runs 1 (`Amateur Collector V`, lowest) to 45 (`Galaxy Collector I`,
highest). Always sort by `sort_order`, never alphabetically — alphabetical order
would put `Amateur` above `Galaxy`.

No `is_active` column on this table.

### `social_links`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | |
| `platform` | `text` | One of `schemas/socialLinkSchema.ts`'s `SOCIAL_PLATFORMS` |
| `label` | `text` | The button text for a contact link; the handle for a follow link |
| `url` | `text` | Opened exactly as stored. Nothing rewrites it |
| `kind` | `text` | `contact` \| `follow`. Added 26 Aug 2026 |
| `is_active` | `boolean` | |
| `display_order` | `integer` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

The single source of social URLs.

`kind` decides which surface a row lands on. `contact` rows are the "Message us
on …" buttons, and the first active one carries every conversation on the site;
`follow` rows are the icon links in the header, footer, homepage band and under
the contact panels. It is `text` with a CHECK constraint — the same choice as
`accounts.status`, and re-validated in Zod on the way in for the same reason.

It carries `not null default 'contact'`, so a row inserted without one behaves
as every row did before the column existed. The application also coerces any
unrecognised value to `contact` when reading (`lib/utils/socialLinks.ts`):
failing that way round costs a follow icon, where the other way round would
hide the button people use to reach the shop.

Added by `supabase/changes/2026-08-26-social-link-kind.sql`, which also inserted
the TikTok and Instagram profiles as the first two `follow` rows.

## Relationships

```
auth.users.id  ──1:1──  profiles.id
accounts.rank_id             ──N:1──  ranks.id
accounts.collection_level_id ──N:1──  collection_levels.id
account_images.account_id    ──N:1──  accounts.id
```

All three resolve as PostgREST embeds, so a listing plus its rank, collection
level and images is a single round trip.

## Row Level Security

Enabled on every table. Verified from the browser-side key:

- anonymous `SELECT` on `ranks` / `collection_levels` → allowed
- anonymous `SELECT` on `profiles` → returns nothing
- anonymous `INSERT` into `accounts` → rejected `401`
- `public.is_admin()` exists and returns `false` for anonymous callers

Admin authorisation flows through `public.is_admin()`, which reads
`profiles.role = 'admin'`. The application **never** bypasses RLS and holds no
service-role key.

Not yet verifiable: whether the public `SELECT` policy on `accounts` excludes
`status = 'hidden'`. There are no rows to test against. This is checked
empirically once the first listing exists.

## Storage

Bucket `account-images`. Layout:

```
account-images/<ACCOUNT_ID>/<timestamp>-<slug>.webp
```

Deleting a listing cascades to `account_images` rows but **not** to Storage
objects — Storage has no foreign keys. `functions/accounts/deleteAccount.ts`
therefore removes the Storage objects first and only then deletes the row.

### The bucket must be marked public

`lib/utils/imagePublicUrl.ts` builds unsigned URLs of the form
`/storage/v1/object/public/account-images/<path>`. That endpoint serves a bucket
**only if the bucket's `public` flag is on**. With the flag off, every such URL
returns `400 {"code":"NoSuchBucket"}` and no screenshot renders anywhere — the
admin uploader, the listing cards, and the gallery all go blank at once.

### How to actually test it

Do not use `POST /storage/v1/object/list/<bucket>`. It returns `200 []` for
every name, including buckets that do not exist, so it proves nothing. An
earlier note in this project recorded the bucket as public on the strength of
that call; the call was meaningless.

These two distinguish all three states, using only the publishable key:

```bash
# Does the bucket exist?  NoSuchKey = yes.  NoSuchBucket = no.
curl -s "$URL/storage/v1/object/account-images/any/path.webp" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY"

# Is it public?  NoSuchKey/200 = yes.  NoSuchBucket = no, the flag is off.
curl -s "$URL/storage/v1/object/public/account-images/any/path.webp"
```

Compare each against a name that certainly does not exist to be sure you are
reading the right signal.
