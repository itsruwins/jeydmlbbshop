-- 0002_enums.sql
-- Closed vocabularies that are structural rather than editable reference data.

-- Spec §9. Ordering of the labels is not significant; transitions are enforced
-- in the application layer (Phase 4), not by the type.
create type public.listing_status as enum ('hidden', 'available', 'reserved', 'sold');

-- Approved Gate 0 addition (D12). Whether the account can be rebound to a new
-- Moonton/e-mail identity — a purchase-deciding fact for buyers.
create type public.transfer_state as enum ('rebindable', 'non_rebindable', 'moonton_only', 'unknown');

-- Spec §7.2. Enables sensible default gallery ordering.
create type public.image_kind as enum ('profile', 'rank', 'skins', 'collection', 'heroes', 'rare_skin', 'other');
