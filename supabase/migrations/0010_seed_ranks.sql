-- 0010_seed_ranks.sql
-- MLBB rank tiers. Approved at Gate 0 (decision D5): ten tiers, no divisions
-- or star counts. Finer granularity is carried by accounts.peak_mythic_points.
--
-- The specification left this vocabulary undefined while marking accounts.rank
-- required; this seed closes that gap.

insert into public.ranks (slug, label, sort_order) values
  ('warrior',            'Warrior',            1),
  ('elite',              'Elite',              2),
  ('master',             'Master',             3),
  ('grandmaster',        'Grandmaster',        4),
  ('epic',               'Epic',               5),
  ('legend',             'Legend',             6),
  ('mythic',             'Mythic',             7),
  ('mythical_honor',     'Mythical Honor',     8),
  ('mythical_glory',     'Mythical Glory',     9),
  ('mythical_immortal',  'Mythical Immortal', 10)
on conflict (slug) do nothing;

do $$
declare n integer;
begin
  select count(*) into n from public.ranks;
  if n <> 10 then
    raise exception 'ranks must contain exactly 10 rows, found %', n;
  end if;
end $$;
