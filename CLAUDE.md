# CLAUDE.md — TIER1 Site Setup Playbook

**Read this file the moment a Claude Code session starts inside this repo.**

It tells you what this project is, how to customize it for a new client, and how to provision and deploy the backend/frontend/DNS. It is the single source of truth for the spin-up flow — don't improvise around it.

---

## 0. Hard constraint: new repos must be under `teddyk28`

When using this template to spin up a new client site, the new repo **must** be created under the GitHub user `teddyk28`. Render and Vercel both have their GitHub Apps installed only on `teddyk28` — they will reject `POST` requests to create services/projects from repos under any other account. The provision scripts in `scripts/provision/` enforce this and exit with a clear error.

If you're the user (`gudalewski123-netizen`) trying to create a new repo and don't have permission, see `TEDDY-SETUP.md` for the one-time GitHub PAT setup that gives you that permission.

## 1. What this repo is

A pnpm-workspace monorepo with three deployable apps and a shared DB layer:

| Path | What it is | Where it deploys |
|---|---|---|
| `artifacts/trades-template/` | Vite + React + Tailwind static marketing site | Vercel |
| `artifacts/client-portal/` | Admin/client portal frontend (only used by some sites) | Vercel (separate project) |
| `artifacts/api-server/` | Express 5 + Drizzle ORM, JWT auth (only used by some sites) | Render |
| `lib/db/` | Drizzle schema (`pg` driver) | Neon (one DB per site) |

The base stack: **Cloudflare DNS → Vercel frontend → Render backend → Neon Postgres → FormSubmit for email**. Auto-deploys on push to `main`.

## 2. Are you in the template or a fresh clone?

Check the repo name (`git remote get-url origin`):

- If it ends in `TIER1REMIXONLYTemplate` → you're in the **template itself**. Do not customize. The user is probably just exploring or improving the template.
- If it ends in anything else (e.g. `acme-roofing`, `joes-hvac`) → this is a **fresh clone for a new client**. Proceed below.

## 3. Decide which tier the site needs

Ask the user, or infer from their description:

| Tier | Includes | When to use |
|---|---|---|
| **1A — Static only** | Vercel + Cloudflare | Marketing-only site. No forms, no admin, no payments. Most small contractors. (Examples: innerstandard.co, wpbjunk.com, doros-detailing.) |
| **1B — Full stack** | Tier 1A + Render API + Neon DB | Site needs admin login, lead capture, Stripe payments, or anything DB-backed. (Examples: thetradestack.net, cleanslatesoftwash.com.) |

If unsure, default to **1A**. You can always upgrade to 1B later.

## 4. Gather client info

Ask the user (or accept from a prompt brief). Bold = required, italic = optional fallback.

- **Business name** (full, e.g. "ACME Roofing Co.") and **shortName** (e.g. "ACME")
- **Trade** (e.g. "Roofing Contractor")
- **Location** (city, state)
- **Service area** (e.g. "South Florida")
- **Phone** (formatted display, e.g. `(786) 555-1234`) and **phoneRaw** (digits with `+1`, e.g. `+17865551234`)
- *Email* — if blank, mailto link is hidden
- *Hours* — defaults to "Open 24 Hours — 7 Days a Week"
- *Years in business*
- **3–6 services** — name + 1-line description each
- **Brand colors** in HSL (e.g. `"142 71% 30%"` — no `hsl()` wrapper). At minimum: primary, background, accent
- *3 sample reviews* — name + text + source (Google Review, Yelp, etc.). If blank, leave the placeholder reviews and flag for the client to provide.
- **Domain** (e.g. `acmeroofing.com`) — must already be on Cloudflare; the user should confirm

## 5. Customize the template files

**Single source of truth:** `artifacts/trades-template/src/config.ts`. Read it first to see the current schema, then replace each export with the client's values.

### Required edits

| File | What to change |
|---|---|
| `artifacts/trades-template/src/config.ts` | Replace every exported object (`BUSINESS`, `HERO`, `ABOUT`, `CTA_BANNER`, `BADGES`, `SERVICES`, `REVIEWS`, `THEME`) with the new client's info |
| `artifacts/trades-template/index.html` (line 6, the `<title>`) | `<title>{Business Name} \| {City, State}</title>` |
| `vercel.json` (only if Tier 1B) | Replace `YOUR-RENDER-SERVICE.onrender.com` with the actual Render URL from step 6 |

### Optional image swaps (in `artifacts/trades-template/public/`)

| File | What it is | Action if user didn't provide |
|---|---|---|
| `favicon.svg` | Browser tab icon | Leave the placeholder, flag as TODO |
| `hero-bg.png` | Homepage hero background | Leave the placeholder, flag as TODO |
| `team-photo.png` | About section photo | Leave the placeholder, flag as TODO |
| `services-bg.png` | CTA banner texture | Leave (it's subtle, rarely needs swapping) |

If the user gave you image URLs, download them with `curl -L -o <path> <url>`. If they gave you local files, copy them.

### Default copy generation

If the user only gave you sparse info (e.g. just "ACME Roofing in Boca, residential roofing"), generate plausible defaults using your judgment:

- For `HERO.headline1` + `headline2`: short, punchy 2-3 words each
- For `ABOUT.body1/2`: 2-3 sentences each, mention the trade and service area
- For `SERVICES`: pick 4-6 standard offerings for that trade
- For `REVIEWS`: leave the existing 3 placeholders unchanged, flag as TODO

Don't fabricate phone numbers, emails, addresses, or specific claims like "Licensed #XYZ" — leave those as empty strings or flag for the client.

## 6. Provision the platforms

Tokens live in `~/.tier1-config/.env` (one-time setup — see section 10). The helper scripts at `scripts/provision/` do the API calls.

### For Tier 1A (static only)

```bash
# Create the Vercel project pointed at this repo
./scripts/provision/vercel.sh <repo-name> <production-domain>

# Add Cloudflare DNS records (apex + www CNAME to vercel-dns-017.com, proxy off)
./scripts/provision/cloudflare.sh <production-domain>
```

### For Tier 1B (full stack)

Order matters — Render before Vercel, because Vercel's API proxy needs the Render URL.

```bash
# 1. Neon — returns DATABASE_URL on stdout
DATABASE_URL=$(./scripts/provision/neon.sh <site-slug>-prod)

# 2. Render — creates service, sets env vars, returns .onrender.com URL on stdout
RENDER_URL=$(./scripts/provision/render.sh <site-slug>-api "$DATABASE_URL" "$ALLOWED_ORIGINS")

# 3. Edit vercel.json with the Render URL (replace the YOUR-RENDER-SERVICE placeholder)
sed -i.bak "s|YOUR-RENDER-SERVICE.onrender.com|${RENDER_URL#https://}|g" vercel.json && rm vercel.json.bak

# 4. Commit + push so Vercel + Render redeploy with the right config
git add -A && git commit -m "Provision <client> infrastructure" && git push origin main

# 5. Vercel project
./scripts/provision/vercel.sh <repo-name> <production-domain>

# 6. Cloudflare DNS
./scripts/provision/cloudflare.sh <production-domain>
```

Each script echoes the result back to stdout on success and exits non-zero on failure with a clear error message. If any step fails, fix the issue (usually a wrong token, an existing resource with the same name, or a missing arg) and re-run that step.

## 7. Commit and push

After all customization edits AND the `vercel.json` URL replacement (if Tier 1B), commit:

```bash
git add artifacts/trades-template/src/config.ts \
        artifacts/trades-template/index.html \
        artifacts/trades-template/public \
        vercel.json
git commit -m "Customize template for {Client Name}"
git push origin main
```

Vercel and Render auto-deploy on every push to `main`.

## 8. Verify

Wait ~60–90 seconds, then:

- **Vercel**: confirm the deploy succeeded — `curl -I https://<project>.vercel.app` should return 200
- **Render** (Tier 1B): `curl https://<render-url>/api/health` should return 200 with `{"status":"ok"}`
- **Cloudflare**: `dig +short <domain>` should resolve to a Vercel IP
- **End-to-end**: load the live domain in a browser, click through, confirm the new branding shows up

If anything 404s or shows the OLD branding, you probably have a build cache — push an empty commit (`git commit --allow-empty -m "Trigger rebuild"`) to retrigger.

## 9. Report to the user

Print a clean summary:

```
Live site:        https://acmeroofing.com
Vercel project:   https://vercel.com/the-tradestacks-projects/acme-roofing
Render API:       https://acme-roofing-api-abc123.onrender.com  (Tier 1B only)
Neon project:     gentle-cloud-12345  (Tier 1B only)
GitHub repo:      https://github.com/teddyk28/acme-roofing

TODOs for the client:
- Provide real hero image (currently using placeholder)
- Provide real team photo
- Provide 3 Google reviews to replace placeholders
```

## 10. One-time token setup (first run only)

The provision scripts read tokens from `~/.tier1-config/.env`. Create it on your machine **once**:

```bash
mkdir -p ~/.tier1-config
chmod 700 ~/.tier1-config

# Then create ~/.tier1-config/.env with this content (filling in real tokens):
cat > ~/.tier1-config/.env <<'EOF'
# Vercel — Personal Access Token from https://vercel.com/account/tokens
VERCEL_TOKEN=vcp_...
VERCEL_TEAM_ID=team_JJsO6rfcfguriDOKqCttwD4U

# Neon — API key from console.neon.tech → Account Settings → API keys
NEON_API_KEY=napi_...
NEON_ORG_ID=org-broad-shape-85063972

# Render — API key from dashboard.render.com → Account Settings → API Keys
RENDER_API_KEY=rnd_...
RENDER_OWNER_ID=tea-d7ul88lckfvc73bbmph0

# Cloudflare — API token from dash.cloudflare.com → My Profile → API Tokens
CLOUDFLARE_API_TOKEN=...

# GitHub PAT (fine-grained, with repo + workflow scopes for teddyk28/*)
GITHUB_PAT=github_pat_...
EOF

chmod 600 ~/.tier1-config/.env
```

If `~/.tier1-config/.env` doesn't exist when a provision script runs, the script will tell you and exit cleanly. Never commit this file or paste its contents into chat.

## 11. Known gotchas (do not relearn the hard way)

- **Render free tier blocks SMTP** (ports 25/465/587). Never use `nodemailer`/Gmail. Always FormSubmit, and always from the **frontend** — server-side `fetch` strips Origin/Referer and FormSubmit then thinks the form is unactivated.
- **FormSubmit "needs activation" returns HTTP 200** — always parse the JSON body for `success: "true"`, not just the status code. Activation links expire ~24 hours.
- **Vercel default output is `dist`** but `trades-template` builds to `dist/public`. `vercel.json` already overrides this — don't change it.
- **Render auto-suffixes service names** if there's any naming collision. Always grab the actual `.onrender.com` URL from the Render API response, never assume it.
- **Neon UI masks password values** — the create script captures the connection string from the API response (which includes the password). Save it immediately to `~/.tier1-config/databases/<slug>.txt` for backup.
- **`vite.config.ts` requires `PORT` and `BASE_PATH` env vars at config load time** (even for `vite build`). `vercel.json`'s `buildCommand` already inlines them — don't strip them.
- **Stripe webhook URL must point directly at Render** (`https://<service>.onrender.com/api/stripe/webhook`), NOT via Vercel — Vercel's proxy mangles the raw body for signature verification.
- **Cloudflare CNAME for Vercel domains must be gray cloud** (proxy DISABLED) and target `vercel-dns-017.com`. The script sets this correctly.
- **`portal.ts` currently has a server-side FormSubmit call** (`artifacts/api-server/src/routes/portal.ts`). This is a known bug — should move to frontend. If a deploy fails because of email weirdness, that's why.

## 12. File map for Claude

When you need to find something:

- **All editable client content** → `artifacts/trades-template/src/config.ts`
- **Page layout / components** → `artifacts/trades-template/src/App.tsx` (single landing page; sections are `id="services"`, `id="about"`, `id="reviews"`, `id="contact"`)
- **Theme application** → `artifacts/trades-template/src/App.tsx` `useApplyTheme()` hook (around line 12)
- **Tailwind base styles** → `artifacts/trades-template/src/index.css`
- **Backend routes** (Tier 1B) → `artifacts/api-server/src/routes/{health,auth,admin,portal}.ts`
- **DB schema** (Tier 1B) → `lib/db/src/schema/`
- **Deploy configs** → `vercel.json`, `render.yaml` at repo root
- **Provision scripts** → `scripts/provision/`
- **This file** → `CLAUDE.md` (you're reading it)

---

**End of playbook.** When in doubt, ask the user — don't guess at brand colors, copy, or domain names. Customizing a client site is a small enough job that one round of clarifying questions is fine.
