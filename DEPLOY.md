# Deploy Checklist

How to spin up a new client website from this template. Follow in order — Render before Vercel, because the Vercel rewrite needs the live Render URL.

## 0. Clone the template

1. On GitHub, click **Use this template → Create a new repository**.
2. Owner: `teddyk28`. Name: `<client-slug>` (e.g. `acme-roofing`).
3. Set to Private. Click **Create repository from template**.

## 1. Neon — create the database

1. Log in to [console.neon.tech](https://console.neon.tech).
2. **Create Project** → name: `<client-slug>-prod` → region: `us-east-1` → Free tier.
3. **Do not enable Neon Auth.**
4. Copy the connection string (Neon masks passwords — copy the full URL with password before it disappears).
5. Ensure the connection string ends with `?sslmode=require&channel_binding=require`. Add it if missing.

## 2. Render — deploy the backend

1. Log in to [render.com](https://render.com).
2. **New → Blueprint** → connect your GitHub → pick the new repo → Render auto-detects `render.yaml`.
3. When prompted for env vars, paste the Neon `DATABASE_URL` and leave the auto-generated `JWT_SECRET` / `ADMIN_API_KEY` alone. Set `ALLOWED_ORIGINS` to `https://<client-slug>.vercel.app` for now (you'll add the real domain in step 4).
4. Click **Apply**. Render builds and deploys.
5. If Render forces "Starter" plan, downgrade to **Free** in the service's plan settings post-creation.
6. **Copy the actual service URL** (e.g. `https://api-server-abc123.onrender.com`) — Render auto-suffixes if there's any naming collision, so don't assume the URL.
7. First build runs `drizzle-kit push` which creates all DB tables in Neon.

## 3. Vercel — deploy the frontend

1. Open `vercel.json` in the repo. Replace `YOUR-RENDER-SERVICE.onrender.com` with the actual Render URL from step 2.6. Commit and push.
2. Log in to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel reads `vercel.json` automatically. No UI overrides needed.
4. Click **Deploy**. Wait for the build to finish.
5. Copy the live `*.vercel.app` URL.

## 4. Cloudflare — wire up the domain

1. In Cloudflare, open the DNS settings for the client's domain.
2. Add CNAME records:
   - **apex** (`@` or root) → `vercel-dns-017.com` — proxy **DISABLED** (gray cloud)
   - **www** → `vercel-dns-017.com` — proxy **DISABLED** (gray cloud)
3. In the Vercel project settings → **Domains**, add the apex and `www` domains. Vercel auto-issues SSL.
4. Back in Render, update the `ALLOWED_ORIGINS` env var to include the real domain (e.g. `https://acme.com,https://www.acme.com,https://<client-slug>.vercel.app`).

## 5. Seed the admin user (if site needs admin login)

1. In Neon's SQL Editor for the new DB, insert an admin user with a bcrypt-hashed password.
2. Set `app_settings.owner_user_id = 'admin:1'` (or whatever the schema uses).

## 6. Stripe (only if site sells)

1. Create the Stripe webhook **pointing directly at Render**: `https://<your-render-service>.onrender.com/api/stripe/webhook` (NOT via Vercel — Vercel's proxy mangles raw body for signature verification).
2. Subscribe to at least `checkout.session.completed`.
3. Copy the `whsec_...` signing secret into Render env vars (`STRIPE_WEBHOOK_SECRET`).
4. Uncomment the Stripe env-var slots in `render.yaml` and re-deploy.

## 7. Email — FormSubmit

The frontend POSTs lead forms directly to `https://formsubmit.co/<email>`. **Never** call FormSubmit from the backend (Render free tier blocks SMTP and Node's `fetch` strips Origin/Referer headers).

FormSubmit activates per `(recipient, origin)` pair. First lead-form submission sends an activation email to `teddy.nk28@gmail.com`. Click once → permanent.

## Gotchas

- **Vercel default output dir is `dist`** but trades-template builds to `dist/public`. `vercel.json` already overrides this.
- **Render auto-suffixes service names**. Always copy the actual `.onrender.com` URL from the dashboard before updating `vercel.json`.
- **Neon UI masks password values** — copy/paste the connection string before navigating away.
- **Render env-var save no-ops if no real change detected**. Type real characters, not synthetic React events.
- **Activation links expire ~24 hours**. If the client says "expired," POST again to trigger fresh activation.
- **FormSubmit "needs activation" returns HTTP 200**. Always inspect the JSON body for `success: "true"`, not just status code.
