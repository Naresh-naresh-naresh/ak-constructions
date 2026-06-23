# Deploy AK Constructions to AWS Amplify

## Prerequisites

- Personal GitHub repo: `Naresh-naresh-naresh/ak-constructions`
- Personal AWS account with Amplify access
- Code pushed to `main` branch

## Step 1 — Push to GitHub

```bash
cd ak-constructions
git add .
git commit -m "AK Constructions website ready for Amplify deploy"
git push -u origin main
```

## Step 2 — Create Amplify app

1. Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. **Create new app** → **Host web app**
3. Choose **GitHub** → authorize if prompted
4. Select account: **Naresh-naresh-naresh**
5. Select repository: **ak-constructions**
6. Select branch: **main**
7. App name: `ak-constructions`
8. Build settings: Amplify should detect `amplify.yml` automatically
9. **Advanced settings** → Environment variables (optional for later):
   - `QUOTE_EMAIL_TO` = client email for quote alerts
10. Click **Save and deploy**

First deploy takes ~5–10 minutes.

## Step 3 — Your live URL

After deploy succeeds, Amplify shows:

```text
https://main.xxxxxxxxx.amplifyapp.com
```

Share this with AK Constructions immediately.

## Step 4 — Custom domain (optional)

1. Amplify app → **Hosting** → **Custom domains**
2. Add domain (e.g. `akconstructions.in`)
3. Copy DNS records to GoDaddy / Namecheap
4. SSL certificate is automatic (free)

## Step 5 — AWS Budget alert (recommended)

1. AWS Console → **Billing** → **Budgets**
2. Create budget: **$10** and **$20** monthly alerts
3. Email: your personal email

## Auto-deploy on every push

After setup, any `git push` to `main` automatically redeploys the site.

```bash
git add .
git commit -m "Update photos"
git push
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Node version | `.nvmrc` sets Node 18 |
| API route `/api/quote` 404 | Ensure SSR is enabled (default for Next.js on Amplify) |
| Images missing | Confirm files are in `public/images/gallery/` and committed |
| Wrong GitHub account | Use `git@github-personal:...` remote, not `github.com` |

## Estimated monthly cost

Low traffic: **$0–5 USD** (often within free tier)
