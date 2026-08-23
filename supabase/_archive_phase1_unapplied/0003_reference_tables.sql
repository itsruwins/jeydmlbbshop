-- 0003_reference_tables.sql
-- Ordered vocabularies. Both carry a numeric sort_order so that progression
-- sorting is a plain integer sort; alphabetical ordering would place
-- "Amateur" above "Galaxy" (spec §8.1).
--
-- The redundant-looking UNIQUE (slug, sort_order) on each table is deliberate:
-- it is the target of a composite foreign key from public.accounts, which makes
-- it structurally impossible for a listing to store a sort_order that does not
-- belong to its slug. See 0005_accounts.sql.

create table public.collection_levels (
  slug        text     not null primary key,
  label       text     not null unique,
  category    text     not null,
  tier        text     not null check (tier in ('V', 'IV', 'III', 'II', 'I')),
  sort_order  smallint not null unique check (sort_order between 1 and 45),
  constraint collection_levels_slug_sort_key unique (slug, sort_order)
);

comment on table public.collection_levels is
  'The 45 canonical MLBB Collection Levels (spec §8). Frozen reference data.';
comment on column public.collection_levels.slug is
  'Stable machine identifier. MUST NOT be shown to users — render label instead.';
comment on column public.collection_levels.sort_order is
  '1 = Amateur Collector V (lowest) .. 45 = Galaxy Collector I (highest).';

create table public.ranks (
  slug        text     not null primary key,
  label       text     not null unique,
  sort_order  smallint not null unique check (sort_order between 1 and 10),
  constraint ranks_slug_sort_key unique (slug, sort_order)
);

comment on table public.ranks is
  'MLBB rank tiers. Approved at Gate 0 (D5): ten tiers, no divisions. Rank '
  'granularity beyond the tier is carried by accounts.peak_mythic_points.';
