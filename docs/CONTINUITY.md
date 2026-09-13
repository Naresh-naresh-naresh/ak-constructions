# Continuity plan — keeping AK's site alive through a job change

Written for the situation where the work laptop goes back to the employer, the
work Claude account disappears, and possibly the work phone too. The goal is
that AK Constructions notices nothing.

`docs/HANDOVER.md` covers *how to run the project* from a clean machine. This
file covers *how to still have access at all*, and how to stop AK being damaged
if Naresh is ever unreachable.

---

## 1. What this project actually is

A lead-generating website plus a small operations tool for a Chennai
construction and interiors firm, built as the first instance of a repeatable
template for other small builders.

Three products in one codebase:

| Part | Who uses it | What it does |
|---|---|---|
| Public site | prospective customers | portfolio, construction packages, quote popup — generates leads |
| `/admin` | AK (Balaji) | create projects, tick off construction stages, assign site engineers, edit packages, read leads |
| `/track` | AK's paying customers | log in with mobile + password, watch their build progress, call their site engineer |

The progress tracker is the differentiator — no local competitor offers it, and
it is why the packages page and the tracker banner both exist on the homepage.

Stack: Next.js 14 (App Router) on Vercel, Supabase Postgres in Mumbai, NextAuth
with two credential providers, Tailwind. Domain at Hostinger. Running cost: ₹0
beyond the domain.

---

## 2. The risk that actually matters

The laptop is not the problem. A laptop is twenty minutes of `git clone` and
`vercel env pull`.

**The problem is that every account is registered to Naresh personally, and AK
Constructions owns nothing.** If Naresh is unreachable for a month — new job,
illness, phone lost, falling out — then AK cannot:

- update a customer's construction progress
- read the leads coming in from their own website
- renew their own domain when it expires
- get anyone else to fix the site, because nobody else can log in

That is a real risk to a real business, and it is worse than losing a laptop
because there is no recovery path at all.

### The fix: AK owns the assets, Naresh operates them

Create a Google account that AK also controls — e.g.
`akconstructionandinteriors@gmail.com` — with Balaji holding the recovery phone
number. Register or transfer the platform accounts to it. Naresh keeps the
password and does all the work; AK can always get back in without him.

Do it in this order, cheapest and least disruptive first:

1. **Domain first.** It is the identity — email, Google Business Profile and
   every printed board depend on it. In Hostinger, set the registrant contact to
   AK's own email, or transfer the domain to an account on that email. A domain
   lost at renewal is the one failure that cannot be undone.
2. **Supabase.** Free tier supports organisation members. Invite AK's email as a
   second owner. This is the client's operational data; it should not be
   reachable only through one person's login.
3. **Vercel.** The Hobby plan is single-user, so a second member is not possible
   without paying for Pro. Two options: move the Vercel project to AK's account
   and have Naresh log in as them, or leave it and rely on the emergency packet
   in section 5. Vercel is the least critical of the three — the code is in
   GitHub, so a new Vercel project can be created and redeployed in under an
   hour, pointing at the same repo and DNS.
4. **GitHub.** Keep this personal. It is Naresh's work and his portfolio. But
   add AK's email as a collaborator on this one repository so the code cannot
   become unreachable.

If AK will not engage with any of this — quite likely — then section 5 is the
fallback, and it is much better than nothing.

---

## 3. What is recoverable, and what is not

| Asset | Lives in | Recoverable without the laptop? |
|---|---|---|
| Code + full history | GitHub | **Yes** — `git clone` |
| Commit-message rationale, design decisions | GitHub (`git log`) | **Yes** |
| All 7 environment variables | Vercel | **Yes** — `vercel env pull` |
| Client photos, logo, OG image | committed in `public/images/` | **Yes** |
| SQL schema | `docs/sql/*.sql` in the repo | **Yes** |
| Package specs (174 lines) | Supabase **+** `docs/sql/packages-seed.sql` | **Yes** |
| **Projects, stages, site teams** | **Supabase only** | **No — unless exported** |
| **Client logins (5 accounts)** | **Supabase only** | **No — unless exported** |
| **Leads from the quote form** | **Supabase only** | **No — unless exported** |
| `/admin` password (plaintext) | Naresh's head only; DB holds a bcrypt hash | No — but regenerable |
| Claude memory + transcripts | this laptop only | No — run the backup script |

The three bold rows are the real gap. Free-tier Supabase has no point-in-time
recovery, so:

```bash
set -a; . ./.env.local; set +a; node scripts/export-database.mjs ~/Desktop
```

Run it **monthly**, and always before anything risky. The output holds bcrypt
hashes and every customer's phone number — encrypt it:

```bash
zip -er ak-db-backup.zip ak-db-backup-*/ && rm -rf ak-db-backup-*/
```

Restoring is a paste job: the JSON keys match the table columns exactly, so
Supabase's table editor "Insert → Import data from CSV/JSON" takes it directly.

---

## 4. The credentials to collect before you leave

Collect these **while you still have the laptop and the work phone**, because
several of them cannot be retrieved later.

### Logins

| Account | What to save | Notes |
|---|---|---|
| GitHub | email, password, **2FA recovery codes** | Likely the master key — see warning below |
| Vercel | how you sign in (GitHub SSO or email + password) | If SSO, losing GitHub loses Vercel too |
| Supabase | email, password, 2FA recovery codes, **database password** | The DB password is separate from the service-role key and is shown only once |
| Hostinger | email, password, 2FA, **renewal date + card on file** | Expiry is the single worst failure |
| Google (Search Console, future Business Profile) | email, password, 2FA recovery codes | Must not be the Freshworks Google account |

> **The SSO trap.** If you signed into Vercel or Supabase with "Continue with
> GitHub", then GitHub is a single point of failure for all three. Check each
> one's login method and save GitHub's 2FA recovery codes on paper as well as in
> the manager.

> **The work-phone trap.** If any authenticator app lives on a Freshworks-issued
> phone, move those 2FA seeds to a personal device now. Recovery codes alone are
> the safety net if you cannot.

### Application values

| Value | Where to get it |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Vercel env vars, or Supabase → Settings → API |
| `NEXTAUTH_SECRET` | Vercel env vars |
| `ADMIN_USERNAME` | Vercel env vars |
| **`/admin` password, in plaintext** | **only in your head** — write it down now |
| `NEXT_PUBLIC_GA_ID` | Vercel env vars |
| Supabase project ref `esckznghjoknsqzyxqwr` | already in this file |

`ADMIN_PASSWORD_HASH` in the environment is a bcrypt hash, so it cannot be
reversed into the password. If the plaintext is lost, generate a new hash —
`docs/ADMIN-SETUP.md` has the command — and update Vercel. Recoverable, but only
while you still have Vercel access.

### Where to store it

**A password manager with web access — Bitwarden's free tier is enough.** It
works from any browser and any phone, so it survives having no laptop at all.

Do **not** use: a notes app on the work laptop, Google Drive on the work
account, a text file in the repo, or email to yourself.

Two things belong on paper as well, in a drawer at home: **GitHub's 2FA recovery
codes** and the **Bitwarden master password**. Those are the keys to everything
else, and a forgotten master password is not recoverable by anyone.

---

## 5. The emergency packet for AK

If the account transfers in section 2 do not happen, do this instead. It costs
one conversation and removes the bus factor.

Give Balaji a sealed envelope, or a single shared Bitwarden item, containing:

- The domain registrar, the login email, and the renewal date
- The Supabase and Vercel login emails
- The `/admin` username and password
- The GitHub repository URL
- One line: *"Any web developer can take over from
  `docs/HANDOVER.md` in this repository."*

That last line is the point. The repo documents its own recovery, so AK is never
dependent on one specific person — which is also the honest thing to offer a
client you are charging money.

Tell him plainly what it is for and that he should not need to open it.

---

## 6. Working with no laptop at all

### Day-to-day operations: a phone is enough

`/admin` is a web app. Creating projects, ticking off stages, adding a site
engineer, editing packages and reading leads all work from a phone browser at
`https://www.akconstructionandinteriors.com/admin`.

Be aware the admin screens were built desktop-first and have few responsive
breakpoints, so they are usable but cramped on a phone. Fine for ticking a stage;
awkward for entering a 60-line package sheet.

### Small code or content changes: a browser is enough

Vercel deploys on every push to `main`, and GitHub has a web editor. So from any
browser — a phone, a library machine, a borrowed laptop:

1. Open the file on `github.com`, press `e` or the pencil icon
2. Edit, then **Commit changes** to `main`
3. Vercel builds and deploys automatically in about 30 seconds

This covers most content edits: prices in `src/config/client.ts`, headings,
testimonials, service areas. No tooling installed, nothing to set up.

### Real development: GitHub Codespaces

For anything needing a terminal, tests or a build, Codespaces gives a full
VS Code and Node environment in the browser, with a monthly free allowance. Open
the repository on GitHub → **Code → Codespaces → Create**. Then the normal
`npm install` and `npm run dev` work, and the preview is forwarded to a URL.

That means a Chromebook, a tablet, or a borrowed machine is a complete
development environment. You do not need to own a laptop to keep this client.

### Claude, on a personal account

Nothing here depends on the Freshworks Claude account. A personal Claude
subscription or an Anthropic API key runs the same tool:

```bash
npm i -g @anthropic-ai/claude-code
```

Conversation history and memory do **not** transfer between accounts. That is
deliberately worked around: the reasoning behind every decision is in the commit
messages and in file header comments, so `git log` is the design document.
Point a fresh session at `docs/HANDOVER.md` and it has the context.

Run `scripts/backup-local-only.sh` before losing the laptop to keep the old
memory files and transcripts.

---

## 7. Do this before you leave — ordered checklist

Rough effort in brackets.

1. **Confirm no account uses the Freshworks email.** Check the login address on
   GitHub, Vercel, Supabase, Hostinger and Google. Git authorship is already the
   personal Gmail; the platform logins are the ones to verify. [15 min]
2. **Move 2FA off any work-issued phone**, and save every recovery code. [30 min]
3. **Put all of section 4 into Bitwarden.** Write the `/admin` plaintext
   password down — it exists nowhere else. [45 min]
4. **Run the database export** and store the encrypted zip. [5 min]
5. **Run `scripts/backup-local-only.sh`** for the env file and Claude memory.
   [5 min]
6. **Rotate the Supabase service-role key** — it was pasted into a chat during
   development. Update Vercel and redeploy after. [20 min]
7. **Note the domain renewal date** and make sure the card on file is personal
   and not expiring. [10 min]
8. **Do section 2 or section 5** — ideally the account transfers, at minimum the
   emergency packet. [one conversation with Balaji]
9. **Verify recovery for real.** Clone into a Codespace, `vercel env pull`,
   `npm run dev`, log into `/admin`. If that works from a browser with nothing
   installed, you are genuinely portable. [30 min]

Step 9 is the one people skip and the only one that proves the rest worked.

---

## 8. Open items that affect the client, not just the code

Carried from `docs/HANDOVER.md` because they are commitments to a paying
customer, not technical debt:

1. **Testimonials on the live site are fabricated.** The clearest legal exposure
   on the site under Indian consumer advertising rules. Replace with real Google
   reviews or delete the section.
2. **The package specs were transcribed from a competitor's published sheet.**
   They are now public promises about what AK supplies — brands, TMT grades,
   concrete mixes, all checkable on site. Balaji must confirm every line he can
   actually deliver.
3. **The hero says "from ₹1,899/sq ft" while the cheapest package says
   ₹2,499.** Contradictory claims on one page; a customer will ask.
4. **`clientConfig.email` is Naresh's personal Gmail**, shown publicly as AK's
   business contact. This also has to change when the freelance engagement ends.
5. **`stats.clientRating` of 4.9★ is unverified**, which is why
   `aggregateRating` was deliberately left out of the structured data.
6. **Test data is still in the database** — projects "Team Test", "Naresh",
   "Saravanan" and a client account on 9700011122. Balaji sees these in `/admin`.
7. **No Google Business Profile exists.** For a local builder this drives more
   leads than the website does, and it is free.
