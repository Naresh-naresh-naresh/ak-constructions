# AK Constructions Website

A modern marketing website for **AK Constructions** — interior design and home construction — built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

Inspired by professional interior design sites (Anbre-style layout) with a **Get Quote** modal and live **₹1,899/sq ft** estimate calculator.

## Features

- Responsive homepage with hero, project gallery, services, process, and reviews
- **Get Quote** modal with BHK selection, sq ft input, and live cost estimate
- Floating call, email, and WhatsApp buttons
- Quote form API route (`POST /api/quote`) — logs leads (ready to connect to email/Sheets)
- **Client config** in one file — easy to clone for your next freelance client

## Quick start

```bash
cd ak-constructions
npm install
npm run dev
```

Open [http://localhost:3005](http://localhost:3005)

> **Important:** If port 3000 shows a login page, that is a *different app* — not this site. Always use **port 3005** (or whatever port `npm run dev` prints in the terminal).

> **Node.js:** Use **Node 18+** (Node 20+ recommended for latest Next.js).

### Images not showing?

1. Confirm file is at `public/images/gallery/hero-1.jpg` (exact name, lowercase)
2. Restart dev server: stop it (Ctrl+C), then `npm run dev` again
3. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
4. Open the URL printed in terminal (e.g. `http://localhost:3005`) — not an old tab on port 3000

## Customize for AK Constructions

Edit **`src/config/client.ts`**:

```typescript
export const clientConfig = {
  name: "AK Constructions",
  ratePerSqFt: 1899,        // ← change pricing here
  phone: "+91 98765 43210", // ← real phone
  whatsapp: "919876543210", // ← WhatsApp number (no +)
  email: "info@akconstructions.in",
  city: "Hyderabad",        // ← client city
  // ...
};
```

## Phase 1: Add photos from WhatsApp (no admin needed)

**Workflow:** Client sends photos on WhatsApp → you save and deploy.

### Step-by-step

1. **Ask AK Constructions** to send 5–10 project photos on WhatsApp:
   - Modular kitchen (2–3 angles)
   - Bedroom / wardrobe
   - Living room / TV unit
   - Full home exterior or completed project

2. **Save files** into `public/images/gallery/` with these exact names:

   | Filename | Where it appears |
   |----------|------------------|
   | `kitchen.jpg` | Gallery (large tile) |
   | `living-room.jpg` | Gallery |
   | `bedroom.jpg` | Gallery |
   | `home-office.jpg` | Gallery |
   | `full-home.jpg` | Gallery |
   | `hero-1.jpg` … `hero-4.jpg` | Homepage hero (right side) |

   See also: `public/images/gallery/PHOTO-CHECKLIST.txt`

3. **Optional:** Edit titles/captions in `src/content/projects.ts`

4. **Preview:** `npm run dev` → open [http://localhost:3000](http://localhost:3000)

5. **Deploy** to AWS Amplify (push to GitHub)

Until photos are added, the site shows a soft gradient placeholder — not broken images.

### Compress large photos

If WhatsApp sends huge files, compress at [squoosh.app](https://squoosh.app) (target: under 500 KB, 1200px wide).

## Project structure

```text
src/
├── app/
│   ├── api/quote/route.ts   # Form submission endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── QuoteModal.tsx       # Quote form + calculator (TypeScript)
│   ├── Header.tsx
│   ├── Hero.tsx
│   └── ...
├── config/
│   └── client.ts            # ← Branding, phone, ₹/sq ft rate
├── content/
│   └── projects.ts          # ← Gallery titles + image paths
├── lib/
│   └── utils.ts             # Currency format, quote math
└── types/
    └── quote.ts             # TypeScript types for form data

public/
└── images/gallery/          # ← Drop client photos here (Phase 1)
```

## How the quote calculator works

```typescript
// src/lib/utils.ts
estimate = sqFt × ratePerSqFt   // e.g. 1200 × 1899 = ₹22,78,800
```

TypeScript ensures `sqFt` and `ratePerSqFt` are numbers — preventing broken quotes on the live site.

## Connect to personal GitHub (Naresh-naresh-naresh)

Your SSH is already set up in `~/.ssh/config`:

| Account | SSH host | GitHub username | Clone format |
|---------|----------|-----------------|--------------|
| Personal (OSS) | `github-oss` | Nareshvellingiri | `git@github-oss:Nareshvellingiri/REPO.git` |
| Work (EMU) | `github-emu` | nvellingiri_fwinc | `git@github-emu:ORG/REPO.git` |
| **Personal1** | `github-personal` | **Naresh-naresh-naresh** | `git@github-personal:Naresh-naresh-naresh/REPO.git` |

This project uses **Personal1** (`github-personal`).

### First-time push

1. Create an empty repo on GitHub: [github.com/new](https://github.com/new)  
   - Name: `ak-constructions`  
   - Logged in as: **Naresh-naresh-naresh**  
   - Do **not** add README (already exists locally)

2. Push from this folder:

```bash
git add .
git commit -m "AK Constructions website — initial version"
git push -u origin main
```

3. Test SSH (optional):

```bash
ssh -T git@github-personal
# Expected: Hi Naresh-naresh-naresh! You've successfully authenticated...
```

## Deploy to AWS (low traffic)

**Option A — AWS Amplify (easiest)**

1. Push repo to GitHub
2. Amplify Console → Connect repo → deploy
3. Add custom domain in Route53

**Option B — S3 + CloudFront**

1. `npm run build` (static export — add `output: 'export'` to next.config if needed)
2. Upload `out/` to S3
3. CloudFront distribution + ACM certificate

**Estimated cost:** ~₹300–600/month at low traffic.

## Next steps

- [ ] Collect photos from client on WhatsApp → save to `public/images/gallery/`
- [ ] Connect `/api/quote` to AWS SES (email alerts) or Google Sheets
- [ ] Add Google Analytics
- [ ] Set up custom domain
- [ ] Record 5-min Loom demo for client handoff

## Freelance / startup reuse

To create a site for **client #2**:

1. Copy this folder
2. Update `src/config/client.ts` only
3. Swap photos and testimonials
4. Deploy to a new Amplify app or S3 bucket

Same template, new brand — ship in days, not weeks.
