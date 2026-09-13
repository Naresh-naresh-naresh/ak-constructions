-- Construction packages (run once in Supabase → SQL Editor → New query).
--
-- Quoted camelCase columns to match `projects`, so rows map 1:1 onto
-- PackageRecord with no mapper layer. Any hand-written SQL against this table
-- must keep the double quotes, or Postgres folds the identifiers to lowercase
-- and errors with `column "ratepersqft" does not exist`.

create table if not exists public.packages (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  "ratePerSqFt"   integer     not null default 0,
  summary         text,
  highlight       boolean     not null default false,
  -- Unpublished packages are editable in admin but invisible to the public, so
  -- a spec sheet can be filled in over several sittings without going live
  -- half-finished.
  published       boolean     not null default false,
  "displayOrder"  integer     not null default 0,
  -- [{ key, title, items: [{ key, label, value }] }]
  categories      jsonb       not null default '[]'::jsonb,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);

-- Same posture as the other tables: RLS on with no policies. Nothing reaches
-- this table except the server, which uses the service_role key and bypasses
-- RLS. The revoke is belt-and-braces for the anon/authenticated roles.
alter table public.packages enable row level security;
revoke all on public.packages from anon, authenticated;

-- The public homepage query filters on published and orders by displayOrder.
create index if not exists packages_published_order_idx
  on public.packages (published, "displayOrder");
