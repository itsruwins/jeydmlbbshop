-- Installment: a listing can be offered on a downpayment.
--
-- Two columns, because the offer is two facts. `installment_available` is
-- whether this listing takes a downpayment at all — it is the flag the
-- catalogue filters on and the card marks. `installment_percents` is which
-- downpayments are on the table: 50%, 70%, 80%, any combination of the three,
-- and the buyer picks one.
--
-- The peso figures are not stored. A downpayment is a percentage of the price,
-- and the price is already in this row — storing the product as well would
-- mean an edited price silently leaves a stale downpayment behind it. It is
-- computed on the way out (`lib/utils/installment.ts`), so it cannot disagree.
--
-- Safe to run more than once.
--
-- Run this BEFORE deploying the code that reads these columns. The app selects
-- them by name, and PostgREST answers a select for a column that does not
-- exist with a 400.

begin;

-- Both default to "no installment", so every listing that already exists keeps
-- behaving exactly as it does today.
alter table public.accounts
  add column if not exists installment_available boolean not null default false;

alter table public.accounts
  add column if not exists installment_percents smallint[] not null default '{}';

-- The vocabulary, enforced as a vocabulary. `<@` is "contained by": every
-- element must be one of the three. The cardinality bound stops a row from
-- carrying the same percentage four times, which `<@` alone would allow.
alter table public.accounts
  drop constraint if exists accounts_installment_percents_check;

alter table public.accounts
  add constraint accounts_installment_percents_check check (
    installment_percents <@ array[50, 70, 80]::smallint[]
    and cardinality(installment_percents) <= 3
  );

-- The two columns are one statement and must not contradict each other. A
-- listing open for installment with no percentages is an offer with no terms;
-- a listing closed to it carrying percentages is a stale value waiting to
-- reappear the next time the flag is flipped. The application writes both in
-- the same update, so this only ever catches a hand-edit.
alter table public.accounts
  drop constraint if exists accounts_installment_consistent_check;

alter table public.accounts
  add constraint accounts_installment_consistent_check check (
    case
      when installment_available then cardinality(installment_percents) > 0
      else cardinality(installment_percents) = 0
    end
  );

comment on column public.accounts.installment_percents is
  'Downpayment percentages offered on this listing: any of 50, 70, 80. Empty unless installment_available.';

commit;

-- Check it landed:
--
--   select account_reference, price, installment_available, installment_percents
--   from public.accounts
--   order by created_at desc;
