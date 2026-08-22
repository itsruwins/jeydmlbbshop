-- 0006_account_images.sql
-- Gallery images (spec §7.2). The database stores the Storage path only;
-- binary image data is never stored in PostgreSQL (spec §3).

create table public.account_images (
  id           uuid            not null primary key default gen_random_uuid(),
  account_id   uuid            not null references public.accounts (id) on delete cascade,
  storage_path text            not null unique,
  sort_order   smallint        not null check (sort_order >= 0),
  is_primary   boolean         not null default false,
  alt_text     text,
  kind         public.image_kind,
  created_at   timestamptz     not null default now(),

  -- DEFERRABLE is required, not cosmetic: drag-to-reorder in the admin swaps
  -- two positions within one transaction, which collides against an immediate
  -- unique constraint. Deferring to commit lets a whole reorder land atomically.
  constraint account_images_order_key unique (account_id, sort_order)
    deferrable initially deferred
);

-- Enforces AT MOST one primary image per listing. It cannot enforce "exactly
-- one" — zero primaries also satisfies a partial unique index. The lower bound
-- is guaranteed by the mutation layer in Phase 4, which promotes the lowest
-- sort_order to primary on first upload and whenever the current primary is
-- deleted. Flagged to the owner in the Phase 0 proposal, §07.
create unique index account_images_one_primary_idx
  on public.account_images (account_id)
  where is_primary;
