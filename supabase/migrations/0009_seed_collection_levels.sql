-- 0009_seed_collection_levels.sql
-- The 45 canonical MLBB Collection Levels (spec v2.0 §8).
-- EXACT VALUES REQUIRED. Do not add, remove, rename, abbreviate, reorder or
-- substitute any row. Amateur Collector V is lowest; Galaxy Collector I is highest.

insert into public.collection_levels (slug, label, category, tier, sort_order) values
  ('amateur_collector_v', 'Amateur Collector V', 'Amateur Collector', 'V', 1),
  ('amateur_collector_iv', 'Amateur Collector IV', 'Amateur Collector', 'IV', 2),
  ('amateur_collector_iii', 'Amateur Collector III', 'Amateur Collector', 'III', 3),
  ('amateur_collector_ii', 'Amateur Collector II', 'Amateur Collector', 'II', 4),
  ('amateur_collector_i', 'Amateur Collector I', 'Amateur Collector', 'I', 5),
  ('junior_collector_v', 'Junior Collector V', 'Junior Collector', 'V', 6),
  ('junior_collector_iv', 'Junior Collector IV', 'Junior Collector', 'IV', 7),
  ('junior_collector_iii', 'Junior Collector III', 'Junior Collector', 'III', 8),
  ('junior_collector_ii', 'Junior Collector II', 'Junior Collector', 'II', 9),
  ('junior_collector_i', 'Junior Collector I', 'Junior Collector', 'I', 10),
  ('seasoned_collector_v', 'Seasoned Collector V', 'Seasoned Collector', 'V', 11),
  ('seasoned_collector_iv', 'Seasoned Collector IV', 'Seasoned Collector', 'IV', 12),
  ('seasoned_collector_iii', 'Seasoned Collector III', 'Seasoned Collector', 'III', 13),
  ('seasoned_collector_ii', 'Seasoned Collector II', 'Seasoned Collector', 'II', 14),
  ('seasoned_collector_i', 'Seasoned Collector I', 'Seasoned Collector', 'I', 15),
  ('expert_collector_v', 'Expert Collector V', 'Expert Collector', 'V', 16),
  ('expert_collector_iv', 'Expert Collector IV', 'Expert Collector', 'IV', 17),
  ('expert_collector_iii', 'Expert Collector III', 'Expert Collector', 'III', 18),
  ('expert_collector_ii', 'Expert Collector II', 'Expert Collector', 'II', 19),
  ('expert_collector_i', 'Expert Collector I', 'Expert Collector', 'I', 20),
  ('renowned_collector_v', 'Renowned Collector V', 'Renowned Collector', 'V', 21),
  ('renowned_collector_iv', 'Renowned Collector IV', 'Renowned Collector', 'IV', 22),
  ('renowned_collector_iii', 'Renowned Collector III', 'Renowned Collector', 'III', 23),
  ('renowned_collector_ii', 'Renowned Collector II', 'Renowned Collector', 'II', 24),
  ('renowned_collector_i', 'Renowned Collector I', 'Renowned Collector', 'I', 25),
  ('exalted_collector_v', 'Exalted Collector V', 'Exalted Collector', 'V', 26),
  ('exalted_collector_iv', 'Exalted Collector IV', 'Exalted Collector', 'IV', 27),
  ('exalted_collector_iii', 'Exalted Collector III', 'Exalted Collector', 'III', 28),
  ('exalted_collector_ii', 'Exalted Collector II', 'Exalted Collector', 'II', 29),
  ('exalted_collector_i', 'Exalted Collector I', 'Exalted Collector', 'I', 30),
  ('mega_collector_v', 'Mega Collector V', 'Mega Collector', 'V', 31),
  ('mega_collector_iv', 'Mega Collector IV', 'Mega Collector', 'IV', 32),
  ('mega_collector_iii', 'Mega Collector III', 'Mega Collector', 'III', 33),
  ('mega_collector_ii', 'Mega Collector II', 'Mega Collector', 'II', 34),
  ('mega_collector_i', 'Mega Collector I', 'Mega Collector', 'I', 35),
  ('world_collector_v', 'World Collector V', 'World Collector', 'V', 36),
  ('world_collector_iv', 'World Collector IV', 'World Collector', 'IV', 37),
  ('world_collector_iii', 'World Collector III', 'World Collector', 'III', 38),
  ('world_collector_ii', 'World Collector II', 'World Collector', 'II', 39),
  ('world_collector_i', 'World Collector I', 'World Collector', 'I', 40),
  ('galaxy_collector_v', 'Galaxy Collector V', 'Galaxy Collector', 'V', 41),
  ('galaxy_collector_iv', 'Galaxy Collector IV', 'Galaxy Collector', 'IV', 42),
  ('galaxy_collector_iii', 'Galaxy Collector III', 'Galaxy Collector', 'III', 43),
  ('galaxy_collector_ii', 'Galaxy Collector II', 'Galaxy Collector', 'II', 44),
  ('galaxy_collector_i', 'Galaxy Collector I', 'Galaxy Collector', 'I', 45)
on conflict (slug) do nothing;

-- Fail the migration loudly if the canonical list is ever short or long.
do $$
declare n integer;
begin
  select count(*) into n from public.collection_levels;
  if n <> 45 then
    raise exception 'collection_levels must contain exactly 45 rows, found %', n;
  end if;
end $$;
