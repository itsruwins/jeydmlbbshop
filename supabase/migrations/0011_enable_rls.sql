-- 0011_enable_rls.sql
-- RLS is switched on here, in Phase 1, with NO policies attached.
--
-- This is deliberately earlier than the Phase 0 plan stated. Rationale: the
-- publishable key ships to every browser, and spec §11.3 is unconditional —
-- "a table with RLS disabled and a public anon key is world-writable". Between
-- Phase 1 and Phase 3 these tables would otherwise be readable and writable by
-- anyone holding a key that is, by design, public.
--
-- With RLS enabled and no policy present, PostgreSQL denies every operation to
-- anon and authenticated. That is the safe state to sit in until Phase 3 grants
-- exactly the access spec §11.2 describes. Nothing in Phase 3 is pre-empted:
-- no policy is created here.
--
-- Note the schema owner and the service/secret key bypass RLS, so migrations,
-- seeding and admin tooling continue to work.

alter table public.collection_levels enable row level security;
alter table public.ranks             enable row level security;
alter table public.profiles          enable row level security;
alter table public.accounts          enable row level security;
alter table public.account_images    enable row level security;
