# Deploy AK Constructions to Vercel

Database setup (Supabase) is a prerequisite — do [ADMIN-SETUP.md](./ADMIN-SETUP.md) first.

## Step 1 — Import the repo

1. Sign up at [vercel.com](https://vercel.com) with your **GitHub** account
2. **Add New → Project** → import `Naresh-naresh-naresh/ak-constructions`
3. Framework preset: Vercel auto-detects Next.js. Leave build settings default.
4. **Don't deploy yet** — add the environment variables first (next step),
   otherwise the first build ships without them and you'll need a redeploy.

## Step 2 — Environment variables

In the import screen (or later under **Settings → Environment Variables**):

| Variable | Value | Environments |
|---|---|---|
| `SUPABASE_URL` | from Supabase | All |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase | All |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | All |
| `ADMIN_USERNAME` | your choice | All |
| `ADMIN_PASSWORD_HASH` | the 60-char `$2b$10$…` hash | All |
| `CRON_SECRET` | any random string | All |
| `NEXTAUTH_URL` | `https://<your-project>.vercel.app` | **Production only** |
| `NEXT_PUBLIC_GA_ID` | GA4 id (optional) | All |

Two things that bite people:

- **`NEXTAUTH_URL` must be Production-scoped only.** If it's set for Preview too,
  every preview deployment redirects you to the production domain after login.
  Left unset for Preview, NextAuth infers the host from Vercel's own env.
- **Unlike Amplify, no `$` escaping is needed here.** Paste the bcrypt hash as-is.
  (The `\$` escaping only applies to local `.env.local` files.)

## Step 3 — Region

**Settings → Functions → Function Region** → set to **Mumbai (`bom1`)**.

This must match the Supabase project's region, or every database call makes a
round trip across continents (~250ms extra per call).

## Step 4 — Deploy

Click **Deploy**. First build takes ~2 minutes. You'll get a URL like:

```text
https://ak-constructions.vercel.app
```

If you set `NEXTAUTH_URL` to a guessed URL before deploying, verify it matches
the real one now and redeploy if not.

## Step 5 — Verify

1. Homepage loads, quote popup appears
2. `/admin/login` → sign in with your credentials
3. Create a test project → toggle a stage → confirm it saves
4. `/track` → enter that project's phone number → progress shows
5. `/api/health` → should return `{"status":"ok","database":"reachable"}`
   (returns 401 if `CRON_SECRET` is set — that's correct, the cron sends the token)
6. Delete the test project row in Supabase → Table Editor when done

## Auto-deploy

Every push to `main` triggers a production deploy. Pushes to other branches and
PRs get their own preview URLs.

```bash
git add .
git commit -m "Update photos"
git push
```

## The keep-alive cron

`vercel.json` registers a daily cron hitting `/api/health`. This exists because
**Supabase's free tier pauses a project after ~7 days with no queries** — and
this site legitimately gets very low traffic, so it would otherwise pause and
the tracker would break until manually resumed.

Verify it's registered under **Settings → Crons** after the first deploy. Vercel
Hobby allows daily granularity, which is plenty against a 7-day window.

If the tracker ever does go down after a quiet period: open the Supabase
dashboard, resume the project, then check why the cron stopped firing.

## Custom domain (optional)

**Settings → Domains** → add e.g. `akconstructions.in` → copy the DNS records to
your registrar. SSL is automatic and free.

After adding a domain, **update `NEXTAUTH_URL` to the new domain and redeploy**,
or admin login will redirect to the old `.vercel.app` URL.

## Estimated monthly cost

- Vercel Hobby: **$0** (note: Hobby terms are intended for non-commercial use —
  Pro is $20/mo if you want to be unambiguously compliant for client work)
- Supabase Free: **$0** (500MB database, far beyond this app's needs)

## Troubleshooting

| Issue | Fix |
|---|---|
| Build fails on Node version | `.nvmrc` pins 20; match it in Settings → General → Node.js Version |
| Admin login redirects in a loop | `NEXTAUTH_SECRET` missing for that environment |
| Preview login sends you to production | `NEXTAUTH_URL` is set for Preview — restrict it to Production |
| "Check the Supabase setup" errors | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` wrong or missing |
| GA not tracking | `NEXT_PUBLIC_GA_ID` is build-time inlined — redeploy after changing it |
