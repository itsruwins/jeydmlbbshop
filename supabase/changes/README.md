# Schema changes — run these by hand, in order

Unlike `supabase/schema/`, which is documentation, **the `.sql` files in this
folder are meant to be executed**: paste one into the Supabase SQL editor and
run it. The project has no migration runner and no service-role key, so there
is nothing that applies them automatically.

Each file is named for the day it was written and is written to be safe to run
twice — `if not exists`, `drop constraint if exists`, and inserts guarded
against duplicating a row that is already there.

**Run the SQL before deploying the code that depends on it.** The application
selects columns by name; PostgREST answers a select for a column that does not
exist with a `400`, which the app surfaces as an error page rather than as a
missing feature. The order is: run the SQL, confirm it, then deploy.

## Applied

| File | What it does | Run on |
| --- | --- | --- |
| `2026-08-26-social-link-kind.sql` | Adds `social_links.kind`, and inserts the TikTok and Instagram profiles as follow links | _not yet run_ |
| `2026-08-27-installment.sql` | Adds `accounts.installment_available` and `accounts.installment_percents`, with the CHECK constraints that keep the pair honest | _not yet run_ |
| `2026-08-28-count-at-least.sql` | Adds `accounts.hero_count_is_min` and `accounts.skin_count_is_min`, so a count can render as "100+" without the figure ceasing to be a number | _not yet run_ |

Update the "Run on" column when you run one, and update `supabase/schema/`
in the same commit so the documented schema still matches the live one.
