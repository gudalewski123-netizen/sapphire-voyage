# CLAUDE.md — TIER 1 Template (TIER1REMIXONLYTemplate)

## What this is
The **Tier 1 starter template** for new client sites. Use this when a client needs:
- A marketing/brochure site
- A client portal where they can request site changes
- Admin login (single admin)
- No payment processing

If they need payments + CRM + sales reps, use **TIER-2-TEMPLATE** instead.

## Stack (when deployed)
- **Frontend:** Vercel (artifacts/trades-template/)
- **Backend:** Render web service (artifacts/api-server/)
- **Database:** Neon Postgres
- **Email:** FormSubmit HTTP (frontend posts directly)
- **Optional:** Cloudflare DNS for custom domain

## Where the Neon DB is
- Pre-provisioned at Neon project `tier1-template-prod` (`gentle-cloud-99890584`)
- Connection string + secrets in `~/Claude/cowork-handoff/TIER_TEMPLATES_NEON_CREDENTIALS.txt`
- The DB is shared across all forks of this template — when you spin up a real client site, **create a fresh Neon project for them** instead of reusing this DB.

## Hard Rules — Never Break
- The pnpm 11 patches in `pnpm-workspace.yaml` (`strictDepBuilds: false`, `verifyDepsBeforeRun: false`) are load-bearing.
- The `preinstall` script in root `package.json` is intentionally absent — do not re-add.
- `artifacts/api-server/src/index.ts` PORT defaults to 10000 — required for Render.
- Email goes via FormSubmit from the FRONTEND, not the backend (Node fetch strips Origin → FormSubmit rejects).
- When forking for a new client: ALSO create their own Neon DB, Render service, Vercel project, and update DATABASE_URL.

## Backend routes provided
- `/api/healthz` — health check
- `/api/admin/*` — admin login + dashboard
- `/api/auth/*` — auth shim
- `/api/portal/*` — client portal (request site changes)

## DB schema includes
- `users` (admin)
- `siteChangeRequests` (client portal submissions)

## To deploy this template for a real client
1. Fork on GitHub → rename to client's site name
2. Apply baseline patches (already applied — don't re-apply)
3. Create fresh Neon project for the client
4. Create Render web service pointing at the fork
5. Set Render env vars: DATABASE_URL (new client's), ADMIN_PASSWORD, SESSION_SECRET, ALLOWED_ORIGINS, LEAD_NOTIFY_TO
6. Run drizzle push (build command does this automatically)
7. Add Vercel project, override Output Directory to `dist/public`
8. Add `vercel.json` with API proxy + SPA fallback
9. Cloudflare DNS: CNAME → vercel-dns-017.com (proxy off)

## Status
✅ Patched and Neon-ready. Not deployed (templates aren't deployed; clones are).
