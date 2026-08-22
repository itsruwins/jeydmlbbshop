-- 0004_profiles.sql
-- Admin identity (spec §11.2). Merely being authenticated does NOT confer
-- admin rights — the role column does. New rows default to 'viewer', which
-- can do nothing, so an auth.users row created by any means is inert until a
-- role is granted deliberately.
--
-- The is_admin() helper and the policies that call it are written in Phase 3.

create table public.profiles (
  id         uuid        not null primary key references auth.users (id) on delete cascade,
  role       text        not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. role=admin is the only thing that grants write access.';
