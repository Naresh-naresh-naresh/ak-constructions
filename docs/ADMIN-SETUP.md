# Admin Dashboard & Client Tracker — AWS Setup

This feature needs a DynamoDB table + an admin login. Do these steps once per client
deployment (they're not automated because they touch your AWS account and secrets).

## 1. Create the DynamoDB table

> **Region:** create this table in **Asia Pacific (Sydney) `ap-southeast-2`** —
> the same region your Amplify app already lives in. Even though your clients
> are in India, co-locating the table with your Amplify app's compute avoids an
> extra cross-region hop on every API call. The India↔Sydney latency for
> end users is a couple hundred ms either way and isn't noticeable for a
> brochure/lead-capture site — it's not worth migrating the whole Amplify app
> to Mumbai just for this. (If you spin up a **new** client's Amplify app from
> scratch later, default that one to `ap-south-1` (Mumbai) instead and keep its
> table in the same region as it.)

AWS Console → **DynamoDB** → **Create table** (check the region selector,
top-right, says "Asia Pacific (Sydney)" first)

- Table name: `ak-constructions-projects` (match whatever you set as `PROJECTS_TABLE_NAME`)
- Partition key: `id` (String)
- Capacity mode: **On-demand** (no capacity planning, effectively $0/month at this volume)

Then add a Global Secondary Index (table → **Indexes** tab → **Create index**):

- Index name: `phone-index`
- Partition key: `phone` (String)

## 2. Create a scoped IAM user

AWS Console → **IAM** → **Users** → **Create user** → `ak-constructions-app`
(programmatic access only, no console login needed)

Attach this inline policy (replace the table ARN with your actual one, shown on the
table's **Overview** tab):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-southeast-2:<account-id>:table/ak-constructions-projects",
        "arn:aws:dynamodb:ap-southeast-2:<account-id>:table/ak-constructions-projects/index/*"
      ]
    }
  ]
}
```

Then **Security credentials** tab → **Create access key** → choose "Application running
outside AWS" → copy the Access Key ID + Secret Access Key (shown once).

## 3. Generate an admin password hash

Pick a username and password for yourself, then run:

```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD_HERE', 10))"
```

Copy the printed hash — that's what goes in `ADMIN_PASSWORD_HASH` locally (never store the
plain password).

For **Amplify production**, base64-encode the hash instead (avoids `$` being stripped
by Amplify's build shell — a 60-char hash often becomes 34 chars and login fails):

```bash
node -e "const h=require('bcryptjs').hashSync('YOUR_PASSWORD_HERE',10); console.log('B64='+Buffer.from(h,'utf8').toString('base64'))"
```

Use the `B64=...` value as `ADMIN_PASSWORD_HASH_B64` in Amplify Console.

> **Gotcha:** in `.env.local` (local dev only), Next.js expands `$` as variable
> syntax, which mangles a bcrypt hash like `$2b$10$...`. Escape every `$` as `\$`
> in `.env.local`, e.g. `ADMIN_PASSWORD_HASH=\$2b\$10\$abc...`. Or set
> `ADMIN_PASSWORD_HASH_B64` locally instead (no escaping needed).

## 4. Set environment variables

Copy `.env.local.example` to `.env.local` for local dev, and add the same keys in
**Amplify Console → your app → Hosting → Environment variables** for production
(Secrets alone are not enough — see note below):

| Variable | Value |
|---|---|
| `PROJECTS_TABLE_NAME` | `ak-constructions-projects` |
| `DYNAMODB_REGION` | `ap-southeast-2` (must match the table's region) |
| `DYNAMODB_ACCESS_KEY_ID` | from step 2 |
| `DYNAMODB_SECRET_ACCESS_KEY` | from step 2 |
| `NEXTAUTH_URL` | your site's real URL, e.g. `https://main.xxxxxxxxx.amplifyapp.com` (locally: `http://localhost:3005`) |
| `NEXTAUTH_SECRET` | any random 32+ char string, e.g. `openssl rand -base64 32` |
| `ADMIN_USERNAME` | the username you picked |
| `ADMIN_PASSWORD_HASH_B64` | base64 of the hash from step 3 (**use this on Amplify**) |
| `ADMIN_PASSWORD_HASH` | optional locally; plain bcrypt hash (see step 3) |

> **Amplify bcrypt gotcha:** plain `ADMIN_PASSWORD_HASH` containing `$2b$10$...`
> is often truncated to ~34 characters during Amplify's build (`echo` strips `$`).
> `/api/debug-env` → `adminPasswordHashEffective.length` must be **60**. If not,
> set `ADMIN_PASSWORD_HASH_B64` instead and remove the plain hash var.

> **Build-time vs runtime:** Amplify **Secrets** are injected into the SSR Lambda
> at request time, but Next.js reads server env vars during `npm run build`. If
> `NEXTAUTH_SECRET` exists only as a Secret, `/api/debug-env` can show
> `present: true` while NextAuth still throws `[MissingSecretError]`. Set these
> keys under **Environment variables** (or both), and keep the `amplify.yml`
> step that writes them to `.env.production` before the build.

> **Why `DYNAMODB_*` and not `AWS_*`?** AWS Amplify Hosting's console
> rejects any environment variable starting with `AWS_` — that prefix is
> reserved for credentials its own runtime injects automatically. The app
> reads `DYNAMODB_REGION`/`DYNAMODB_ACCESS_KEY_ID`/`DYNAMODB_SECRET_ACCESS_KEY`
> instead and passes them to the AWS SDK explicitly (see `src/lib/dynamodb.ts`).

Redeploy after adding Amplify env vars (Amplify → **Redeploy this version**, or push a
new commit).

## Using it

- Admin: `/admin/login` → create/update projects, tick off construction stages.
- Client: `/track` → client enters the mobile number you registered their project
  under, sees their live progress. No login needed for clients — just a phone-number
  match.
