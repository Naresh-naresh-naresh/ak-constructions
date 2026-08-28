# Admin Dashboard & Client Tracker — Supabase Setup

The admin dashboard (`/admin`) and client tracker (`/track`) need a Supabase
database plus admin login credentials. Do these steps once per client deployment.

For hosting/deploy steps, see [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md).

## 1. Create the Supabase project + table

1. Sign up at [supabase.com](https://supabase.com) → **New project**
2. Region: **Mumbai (ap-south-1)** — closest to India-based users. Keep this the
   same region as the Vercel function region so DB calls don't cross continents.
3. Save the database password it generates (not needed by this app, but you'll
   want it if you ever connect with `psql`).
4. Open **SQL Editor** → **New query** → paste and run:

```sql
create table public.projects (
  id              uuid        primary key default gen_random_uuid(),
  "clientName"    text        not null,
  phone           text        not null,
  "siteLocation"  text        not null,
  "areaSqFt"      integer     not null,
  floors          text        not null,          -- "G+1" etc, NOT numeric
  "startedOn"     date        not null,          -- app sends "YYYY-MM-DD"
  status          text        not null default 'on_schedule'
                    check (status in ('on_schedule', 'delayed', 'completed')),
  stages          jsonb       not null default '[]'::jsonb,
  notes           text,                          -- nullable
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now(),
  "lastCheckedAt" timestamptz,
  "checkCount"    integer     not null default 0
);

-- Supports getProjectsByPhone (the /track lookup).
-- NOT unique: one phone can legitimately own several projects.
create index projects_phone_idx on public.projects (phone);
create index projects_created_at_idx on public.projects ("createdAt" desc);

-- Intentionally NO policies: the app connects with the service_role key, which
-- bypasses RLS. Everyone else (incl. the public anon key) sees zero rows.
alter table public.projects enable row level security;

-- Atomic increment for the tracker's "checked N times" counter.
-- Must be a function: PostgREST cannot express `checkCount = checkCount + 1`.
-- Deliberately does NOT touch "updatedAt" — a visitor checking status isn't an edit.
create or replace function public.increment_project_check(project_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.projects
     set "checkCount"    = "checkCount" + 1,
         "lastCheckedAt" = now()
   where id = project_id;
$$;

revoke execute on function public.increment_project_check(uuid) from public;
revoke execute on function public.increment_project_check(uuid) from anon, authenticated;
grant  execute on function public.increment_project_check(uuid) to service_role;

-- Invite code the admin shares so a client can register (see "Client accounts").
alter table public.projects add column if not exists "signupCode" text;

-- Backfill any pre-existing projects so those clients can still register.
update public.projects set "signupCode" = upper(substr(md5(random()::text), 1, 7))
 where "signupCode" is null;

-- Client login accounts. One row per phone; a phone may own several projects.
create table public.client_accounts (
  phone            text        primary key check (phone ~ '^[0-9]{10}$'),
  "passwordHash"   text        not null,
  "failedAttempts" integer     not null default 0,
  "lockedUntil"    timestamptz,
  "createdAt"      timestamptz not null default now(),
  "lastLoginAt"    timestamptz
);

alter table public.client_accounts enable row level security;
-- Extra layer beyond RLS, because this table holds password hashes.
revoke all on public.client_accounts from anon, authenticated;
```

5. **Project Settings → API** → copy:
   - **Project URL** → `SUPABASE_URL`
   - **`service_role` secret** (or `sb_secret_…` on newer projects) → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ The `service_role` key is full database admin and bypasses RLS. Never prefix
> it `NEXT_PUBLIC_`, never use it in client-side code. If it leaks, rotate it
> immediately in Project Settings → API.

> The Supabase dashboard will show a permanent "RLS enabled with no policies"
> advisor warning on this table. That is the intended design, not a defect.
> Corollary: if a query fails, it is never RLS — service_role bypasses it. Look
> for a quoted-column typo or a bad key instead.

### Notes on the schema

- **Quoted camelCase columns** are deliberate — they map 1:1 onto the
  `ProjectRecord` TypeScript type with no translation layer. Tradeoff: any
  hand-written SQL must quote them (`"clientName"`, not `clientName`), or
  Postgres folds to lowercase and errors with `column "clientname" does not exist`.
- **Do not** add a `BEFORE UPDATE` trigger to auto-maintain `updatedAt`. Every
  anonymous tracker check would then bump the project's "last updated" time.

## 2. Generate an admin password hash

Pick a username and password, then:

```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD_HERE', 10))"
```

That 60-character `$2b$10$…` string is `ADMIN_PASSWORD_HASH`. Never store the
plain password anywhere.

**Locally**, Next.js expands `$` in `.env.local`, which mangles the hash. Either
escape every `$` as `\$`, or use the base64 form instead (no escaping needed):

```bash
node -e "const h=require('bcryptjs').hashSync('YOUR_PASSWORD_HERE',10); console.log(Buffer.from(h,'utf8').toString('base64'))"
```

…and set that as `ADMIN_PASSWORD_HASH_B64`.

> Set only **one** of `ADMIN_PASSWORD_HASH` / `ADMIN_PASSWORD_HASH_B64` per
> environment. The B64 branch wins unconditionally, so a stale B64 value would
> silently override a correct plain hash and login would fail with no clue why.

## 3. Environment variables

Copy `.env.local.example` → `.env.local` for local dev, and set the same keys in
Vercel (see [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)).

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Project URL from step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from step 1 |
| `NEXTAUTH_URL` | Live site URL in production (Production scope only); `http://localhost:3005` locally |
| `NEXTAUTH_SECRET` | Random 32+ chars — `openssl rand -base64 32` |
| `ADMIN_USERNAME` | Whatever you picked |
| `ADMIN_PASSWORD_HASH` *or* `_B64` | From step 2 — set exactly one |
| `CRON_SECRET` | Optional; protects `/api/health`. Any random string |
| `NEXT_PUBLIC_GA_ID` | Optional; GA4 Measurement ID |

## Using it

- **You (admin)**: `/admin/login` → create a project with the client's mobile
  number → tick off construction stages as work progresses. You can also add or
  remove custom stages per project (e.g. "Kitchen Tiles").
- **The client**: registers once at `/signup`, then logs in at `/login` with
  their mobile number + password to see live progress at `/track`.

### Client accounts (invite codes)

Clients cannot self-register from nothing — a project must exist first, and they
must present the invite code you issue. That code is the security boundary: a
mobile number is **not** a secret (it used to be the public key to the old
tracker), so gating on the number alone would let anyone who knows a client's
number claim that account before the client does.

**Onboarding a client:**
1. Create their project in `/admin` — a 7-character invite code is generated
   automatically (e.g. `7F2K9MP`).
2. Open the project → **Client login** panel → tap **WhatsApp**. This opens a
   prefilled message containing the signup link, their number, and the code.
3. The client goes to `/signup`, enters mobile + code + a password of their
   choosing, and is logged straight in.

**If a client forgets their password** (or you suspect a code leaked): open the
project → **Reset client login**. That deletes their account *and* issues a new
invite code, so the old one can't be replayed. Send them the new code and they
re-register.

Notes on behaviour:
- Project **notes stay admin-only** — clients never see them.
- 5 wrong passwords locks that account for 15 minutes.
- Sessions are JWT-based, so a reset doesn't force-log-out an already-open
  session immediately; it prevents future logins. At this scale that's an
  accepted trade-off.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Could not load projects. Check the Supabase setup." | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` missing or wrong |
| `column "clientname" does not exist` in SQL Editor | Missing double quotes around a camelCase column |
| Login fails with no useful error | Both `ADMIN_PASSWORD_HASH` and `_B64` set, and the B64 one is stale |
| Login succeeds then bounces back to `/admin/login` | `NEXTAUTH_SECRET` missing or different for that environment. Also expected once right after client accounts shipped — old sessions carry no role claim, so log in again |
| Client signup says "number and invite code don't match" | Code was mistyped, or it was regenerated by a reset. Resend from the project's Client login panel |
| Client signup returns a 503 | The `signupCode` column / `client_accounts` table SQL above wasn't run |
| Client logs in but sees "No project is linked to this number" | Their account exists but no project has that phone — check for a typo in the project's mobile number |
| Tracker unavailable after ~a week idle | Supabase free tier paused the project. The daily `/api/health` cron prevents this — check Vercel → Crons. Un-pause in the Supabase dashboard |
| `Could not find the function public.increment_project_check` | The RPC SQL above wasn't run, or PostgREST's cache is stale (`notify pgrst, 'reload schema';`) |
