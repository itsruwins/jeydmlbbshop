-- "100+ heroes": a count the seller will not pin down exactly.
--
-- An account with a few hundred heroes is rarely counted to the unit, and the
-- market quotes it the way sellers actually know it — "100+", "500+". The
-- column could have been widened to text to hold that, but then the number
-- stops being a number: `skin_count` is what the catalogue filters on
-- (`.gte("skin_count", …)`), and a text column cannot answer that.
--
-- So the figure stays an integer and the "+" becomes what it actually is — a
-- separate fact about the figure. `hero_count = 100` with
-- `hero_count_is_min = true` reads "at least 100 heroes", which is exactly
-- what the buyer is being told, and `gte` still means the right thing over it.
-- Same reasoning as the installment columns: store the fact, derive the
-- display.
--
-- Safe to run more than once.
--
-- Run this BEFORE deploying the code that reads these columns. The app selects
-- them by name, and PostgREST answers a select for a column that does not
-- exist with a 400.

begin;

-- Both default to false, so every listing that already exists keeps rendering
-- the exact figure it renders today.
alter table public.accounts
  add column if not exists hero_count_is_min boolean not null default false;

alter table public.accounts
  add column if not exists skin_count_is_min boolean not null default false;

-- A "+" with nothing in front of it is not a claim. The count is optional, and
-- when it is absent the surfaces render an em dash rather than a figure, so a
-- flag set on an empty count would be a value that can never be seen — and one
-- that would silently turn into "0+" the day someone added a zero. The
-- application clears the flag alongside the count, so this only ever catches a
-- hand-edit.
alter table public.accounts
  drop constraint if exists accounts_hero_count_is_min_check;

alter table public.accounts
  add constraint accounts_hero_count_is_min_check check (
    not hero_count_is_min or hero_count is not null
  );

alter table public.accounts
  drop constraint if exists accounts_skin_count_is_min_check;

alter table public.accounts
  add constraint accounts_skin_count_is_min_check check (
    not skin_count_is_min or skin_count is not null
  );

comment on column public.accounts.hero_count_is_min is
  'True when hero_count is a floor rather than an exact figure: 100 renders as "100+". False unless hero_count is set.';

comment on column public.accounts.skin_count_is_min is
  'True when skin_count is a floor rather than an exact figure: 500 renders as "500+". False unless skin_count is set.';

commit;

-- Check it landed:
--
--   select account_reference, hero_count, hero_count_is_min,
--          skin_count, skin_count_is_min
--   from public.accounts
--   order by created_at desc;
