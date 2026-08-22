-- 0005_accounts.sql
-- The listing table (spec §7.1, plus the four field additions approved at
-- Gate 0 as decision D12).

create table public.accounts (
  id                 uuid           not null primary key default gen_random_uuid(),

  -- Human-readable, URL-safe, immutable once published. Used in /accounts/<reference>
  -- and in the pre-filled social message (spec §5.1, Gate 0 decision D1).
  reference          text           not null unique
                                      check (reference ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title              text,

  -- Whole Philippine pesos. Gate 0 decision D13: centavos are never quoted in
  -- this market, so an integer keeps arithmetic exact and sorts natively.
  -- Never a float, never a formatted string (spec §3.1).
  price_php          integer        not null check (price_php >= 0),

  -- Nullable original price, reserved for a future promos surface (D9).
  -- No UI consumes this in the MVP.
  compare_at_php     integer        check (compare_at_php > price_php),

  rank_slug          text           not null,
  rank_sort          smallint       not null,
  peak_mythic_points integer        check (peak_mythic_points >= 0),   -- D12

  collection_slug    text           not null,
  collection_sort    smallint       not null,

  signature_hero     text,                                             -- D12
  server             text,
  account_level      integer        check (account_level >= 1),
  hero_count         integer        check (hero_count >= 0),
  skin_count         integer        check (skin_count >= 0),
  transfer           public.transfer_state not null default 'unknown', -- D12
  features           text[]         not null default '{}',             -- D12

  -- Plain text. Rendered escaped; HTML is never rendered from this column
  -- (spec §6.3, §11.3).
  description        text,

  -- Defaults to hidden so a half-finished listing can never publish by
  -- accident. Publishing is a deliberate act (spec §7.1).
  status             public.listing_status not null default 'hidden',
  is_featured        boolean        not null default false,

  -- First time status left 'hidden'. "Newest" means newest published, not
  -- newest drafted. Maintained by the application layer in Phase 4.
  published_at       timestamptz,

  created_at         timestamptz    not null default now(),
  updated_at         timestamptz    not null default now(),

  -- One column feeding one trigram index (see 0007_indexes.sql).
  search_blob        text generated always as (
                       reference || ' ' ||
                       coalesce(title, '') || ' ' ||
                       coalesce(signature_hero, '') || ' ' ||
                       coalesce(description, '')
                     ) stored,

  -- The pair is validated as a pair. A listing cannot hold a collection_sort
  -- that disagrees with its collection_slug, with no trigger and no join
  -- required at query time (spec §7.3).
  constraint accounts_collection_fk foreign key (collection_slug, collection_sort)
    references public.collection_levels (slug, sort_order),
  constraint accounts_rank_fk foreign key (rank_slug, rank_sort)
    references public.ranks (slug, sort_order)
);

comment on column public.accounts.search_blob is
  'Generated. Backs marketplace ?q= search via a GIN trigram index.';
