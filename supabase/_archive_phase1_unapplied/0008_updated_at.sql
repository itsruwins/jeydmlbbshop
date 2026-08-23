-- 0008_updated_at.sql
-- The only trigger in the schema. Everything else is declarative.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row
  execute function public.set_updated_at();
