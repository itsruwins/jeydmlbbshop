-- Social links: tell "message us here" apart from "follow us here".
--
-- Until now every row in social_links became a "Message us on …" button. That
-- is right for Messenger and WhatsApp and wrong for a feed: a buyer holding a
-- reference code who lands on a TikTok profile has nowhere to put it. `kind`
-- is what separates them — 'contact' rows stay the message buttons, 'follow'
-- rows render as icons in the header, the footer, the homepage band and under
-- the contact panels.
--
-- Safe to run more than once.
--
-- Run this BEFORE deploying the code that reads `kind`. The app selects the
-- column by name, and PostgREST answers a select for a column that does not
-- exist with a 400.

begin;

-- Defaulting to 'contact' means every row that already exists keeps behaving
-- exactly as it does today. Nothing disappears from the site when this runs.
alter table public.social_links
  add column if not exists kind text not null default 'contact';

alter table public.social_links
  drop constraint if exists social_links_kind_check;

alter table public.social_links
  add constraint social_links_kind_check check (kind in ('contact', 'follow'));

-- The two feeds, appended after whatever is already there so this cannot
-- demote the link currently carrying every conversation.
--
-- The URLs are the canonical profile addresses, with the share-tracking
-- parameters (`?_r=1`, `?igsi=…`) stripped: those identify the share that was
-- copied, not the profile, and they expire.
insert into public.social_links (platform, label, url, kind, is_active, display_order)
select v.platform, v.label, v.url, 'follow', true,
       (select coalesce(max(display_order), -1) from public.social_links) + v.seq
from (values
  ('TikTok',    '@jeydselyn', 'https://www.tiktok.com/@jeydselyn', 1),
  ('Instagram', '@je_ydd',    'https://www.instagram.com/je_ydd',  2)
) as v(platform, label, url, seq)
where not exists (
  select 1 from public.social_links existing where existing.url = v.url
);

commit;

-- Check it landed:
--
--   select platform, label, kind, is_active, display_order
--   from public.social_links
--   order by display_order;
