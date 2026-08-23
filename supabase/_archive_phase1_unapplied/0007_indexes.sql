-- 0007_indexes.sql
-- Every index here exists to serve a specific query in the spec's
-- query-parameter contract (§5.2) or a performance budget (§14.1).

-- Default marketplace listing + `newest` / `oldest` sorts. Partial: the public
-- catalogue never reads hidden rows.
create index accounts_public_published_idx
  on public.accounts (status, published_at desc)
  where status <> 'hidden';

-- ?min_price / ?max_price, and the price_asc / price_desc sorts.
create index accounts_price_idx on public.accounts (price_php);

-- ?collection_min / ?collection_max and the collection_desc sort.
create index accounts_collection_sort_idx on public.accounts (collection_sort);

-- ?min_skins chips and the skins_desc sort.
create index accounts_skin_count_idx on public.accounts (skin_count);

-- ?rank multi-select.
create index accounts_rank_sort_idx on public.accounts (rank_sort);

-- Homepage featured row. Tiny partial index: featured is ignored for anything
-- that is not available, so the homepage can never showcase a sold account
-- (spec §9.2).
create index accounts_featured_idx
  on public.accounts (published_at desc)
  where is_featured and status = 'available';

-- ?q free-text search. Operator class is schema-qualified because pg_trgm
-- lives in the extensions schema and search_path is not guaranteed here.
create index accounts_search_trgm_idx
  on public.accounts using gin (search_blob extensions.gin_trgm_ops);

-- Gallery fetch, already in display order.
create index account_images_account_order_idx
  on public.account_images (account_id, sort_order);
