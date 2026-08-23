# Archived — Phase 1 migrations that were never applied

**Do not run anything in this folder against the Supabase project.**

These files describe a schema design that was superseded before it reached the
database. The live Supabase project was built separately and does **not** match
them. Applying them would attempt to create conflicting tables.

## How they diverge from the live schema

| Concern | This archive | Live database (authoritative) |
| --- | --- | --- |
| Reference PKs | `text` slugs (`grandmaster`) | `uuid` |
| Account reference | `reference` | `account_reference` |
| Price | `price_php` | `price` |
| Rank link | `rank_slug` + `rank_sort` | `rank_id` |
| Collection link | `collection_slug` + `collection_sort` | `collection_level_id` |
| Image order | `sort_order` | `display_order` |
| Cover image | `is_primary` | `is_cover` |
| Rank labels | `label` | `name` |
| Collection labels | `label`, `tier` | `name`, `level` |
| Rank list | **10 tiers, including Warrior / Elite / Master** | **7 tiers, Grandmaster → Mythical Immortal** |
| `social_links` | absent | present |
| Extra columns | `published_at`, `transfer`, `features`, `signature_hero`, `peak_mythic_points`, `compare_at_php`, `search_blob` | none of these |

The rank list is the most important difference. The project specification
explicitly excludes Warrior, Elite and Master. The live database is correct.

`ranks.ts.bak` and `collection-levels.ts.bak` were `lib/constants/` files that
mirrored these archived migrations, so they carried the same wrong rank list and
the same wrong column shape. They are retained here only for reference. Nothing
in the application imports them — ranks and collection levels are read from
Supabase at runtime.

## Where the real schema is documented

`supabase/schema/` — reference documentation of the live database. It is
documentation, not migrations; nothing there is meant to be executed either.

This whole folder is safe to delete once you no longer want the history.
