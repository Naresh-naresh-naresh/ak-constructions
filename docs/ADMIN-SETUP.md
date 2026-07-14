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

Copy the printed hash — that's what goes in `ADMIN_PASSWORD_HASH` (never store the
plain password).

> **Gotcha:** in `.env.local` (local dev only), Next.js expands `$` as variable
> syntax, which mangles a bcrypt hash like `$2b$10$...`. Escape every `$` as `\$`
> in `.env.local`, e.g. `ADMIN_PASSWORD_HASH=\$2b\$10\$abc...`. This does **not**
> apply to Amplify Console env vars — those are injected directly, no escaping
> needed there.

## 4. Set environment variables

Copy `.env.local.example` to `.env.local` for local dev, and add the same keys in
**Amplify Console → your app → Hosting → Environment variables** for production:

| Variable | Value |
|---|---|
| `PROJECTS_TABLE_NAME` | `ak-constructions-projects` |
| `AWS_REGION` | `ap-southeast-2` (must match the table's region) |
| `AWS_ACCESS_KEY_ID` | from step 2 |
| `AWS_SECRET_ACCESS_KEY` | from step 2 |
| `NEXTAUTH_URL` | your site's real URL, e.g. `https://main.xxxxxxxxx.amplifyapp.com` (locally: `http://localhost:3005`) |
| `NEXTAUTH_SECRET` | any random 32+ char string, e.g. `openssl rand -base64 32` |
| `ADMIN_USERNAME` | the username you picked |
| `ADMIN_PASSWORD_HASH` | the hash from step 3 |

Redeploy after adding Amplify env vars (Amplify → **Redeploy this version**, or push a
new commit).

## Using it

- Admin: `/admin/login` → create/update projects, tick off construction stages.
- Client: `/track` → client enters the mobile number you registered their project
  under, sees their live progress. No login needed for clients — just a phone-number
  match.
