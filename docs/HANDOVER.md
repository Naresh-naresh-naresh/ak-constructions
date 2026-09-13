# Handover — running this project from a clean machine

Everything needed to pick this project back up with no prior context, no chat
history, and no particular AI assistant. If you are reading this after losing a
laptop or an account, start here.

## Accounts that own the live system

| Thing | Provider | What breaks without it |
|---|---|---|
| Code + history | GitHub `Naresh-naresh-naresh/ak-constructions` | everything |
| Hosting, env vars, cron | Vercel, project `ak-constructions` (Hobby) | the live site |
| Database | Supabase (Mumbai region) | leads, projects, client logins |
| Domain + DNS | Hostinger, `akconstructionandinteriors.com` | the domain |

**Verify each of these is registered to a personal email, not a work one.** Git
authorship is already the personal Gmail. Confirm the Supabase and Vercel login
addresses — a work address on any of them is a single point of failure the day
the job ends.

## Secrets, and where the only copy lives

`.env.local` is gitignored, so it exists on one laptop and in Vercel's
Environment Variables. Vercel is the durable copy. Pull it on a new machine:

```bash
npm i -g vercel && vercel link && vercel env pull .env.local
```

Then set `NEXTAUTH_URL=http://localhost:3005` in the pulled file — Vercel's copy
holds the production URL, and NextAuth builds callback URLs from it, so local
login fails if you leave the production value in place.

| Variable | If lost |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API. Rotating the service-role key requires updating Vercel and redeploying. |
| `NEXTAUTH_SECRET` | Generate a new one. Every existing session is invalidated — everyone logs in again. Not fatal. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` | Generate a fresh bcrypt hash. See `docs/ADMIN-SETUP.md`. |
| `NEXT_PUBLIC_GA_ID` | Cosmetic; analytics only. |

Beware `$` in `.env.local`: Next.js runs values through dotenv-expand, so a
bcrypt hash containing `$` gets mangled unless each one is escaped `\$`. This
has caused a silent admin-login failure before. `ADMIN_PASSWORD_HASH_B64` exists
as a base64 alternative that avoids the problem entirely.

## Getting back to a working dev environment

```bash
git clone git@github.com:Naresh-naresh-naresh/ak-constructions.git
cd ak-constructions && npm install
```

Then pull the env file as above and:

```bash
npm run dev
```

**Port 3005, not 3000.** `NEXTAUTH_URL` pins it and auth breaks on any other
port. `.claude/launch.json` sets `autoPort: false` for the same reason.

## The two gotchas that cost the most time

**Never run `npm run build` while `npm run dev` is running.** They share
`.next/` and collide, producing a nonsense error like `Cannot find module
'./948.js'`. Fix: stop dev, `rm -rf .next`, restart. This has happened twice.

**Keep the Vercel function region as Mumbai (`bom1`).** Supabase is in Mumbai. A
mismatched function region took DB calls from 300 ms to 1500 ms. Diagnose from
the response header `x-vercel-id: <edge>::<function-region>::<id>` — both
segments should read `bom1`. Do not diagnose this from timings alone.

## Architecture, in one pass

Next.js 14 App Router, TypeScript, Tailwind. NextAuth v4 with a JWT strategy and
**two** `CredentialsProvider`s that have explicit ids (`admin-login`,
`client-login`) — the default id is `"credentials"` for both, so without explicit
ids they collide and only one ever resolves.

Authorization rules worth not re-deriving:

- Role comes from `account.provider`, mapped through an allowlist in
  `src/lib/roles.ts` that **fails closed**. A token with no role is denied
  everywhere, which is what makes old cookies safe after a deploy.
- `src/lib/roles.ts` must stay dependency-free. `middleware.ts` imports it and
  runs on the Edge; importing `auth.ts` would drag bcrypt and the Supabase
  client into the Edge bundle.
- **Middleware cannot protect API routes here.** Every `/api/admin/*` handler
  calls `requireAdmin()` itself. Do not remove those checks on the assumption
  that the matcher covers them.
- `/track` is a Server Component on purpose. The client's phone comes only from
  the session, never a request parameter, so there is no way to ask for someone
  else's project and no per-user GET route to accidentally cache.
- Client signup is gated by an admin-issued invite code, not by the phone number
  alone. A phone number is not a secret in this product — phone-only gating
  would let anyone who knows a client's number claim the account first.

Supabase is reached via PostgREST (`@supabase/supabase-js`) with the service-role
key. Two consequences: column names are quoted camelCase, and **the client does
not throw on error** — every call must check `error` explicitly. RLS is enabled
with no policies; service-role bypasses it.

## Open items (as of 2026-09-01)

Ordered by how much they matter.

1. **Testimonials are fabricated.** They are live on a commercial site. This is
   the one item that is a genuine legal exposure under Indian consumer
   advertising rules, not just untidy. Replace with real Google reviews or
   remove the section.
2. **`clientConfig.email` is a personal Gmail** presented as the business
   contact address in the public footer.
3. **Test data is live in Supabase** — projects "Team Test", "Priya Sharma",
   "Saravanan", and a client account on 9700011122. Balaji sees these in
   `/admin`.
4. **`stats.clientRating` of 4.9★ is unverified.** Same class of problem as the
   testimonials, and it is why `aggregateRating` was deliberately left out of the
   JSON-LD in `layout.tsx` — fake ratings in structured data are what Google's
   spam policy targets.
5. **Packages are entered in `/admin/packages`**, not in code. Each package
   stays a draft until Published is ticked. Nothing is seeded — the specs have
   to come from AK. Do not invent brands or concrete grades; see
   `docs/PACKAGES-CHECKLIST.md` for the sheet to collect them with.
6. **Google Business Profile does not exist yet.** For a local builder this
   matters more than the website — the map pack ranks on proximity, reviews and
   category rather than domain authority.
7. **Next.js is on 14.2.28** with known Critical/High advisories. Upgrading to 16
   is a breaking change; budget real time.
8. **Service-role key was pasted into a chat** at some point and should be
   rotated.

## Continuing with an AI assistant, or without one

Nothing here depends on a particular assistant or account. The reasoning behind
each decision is in the git commit messages — they are deliberately long for
this reason — and in the header comments of the files it applies to. `git log`
is the design document.

To resume with Claude Code on a personal account: install a personal Claude
subscription or an API key, `npm i -g @anthropic-ai/claude-code`, clone the
repo, and point it at this file. Conversation history and memory do not transfer
between accounts, which is why the durable context lives in the repo instead.
