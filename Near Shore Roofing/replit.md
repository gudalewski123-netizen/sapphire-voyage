# Near Shore Roofing LLC — Tier 1 Site

## Overview
Custom Tier 1 site for Near Shore Roofing LLC, a family-owned roofing contractor based in Vero Beach, FL serving the Treasure Coast (Vero Beach, Sebastian, St. Lucie & Brevard Counties).

## Business
- **Name**: Near Shore Roofing LLC
- **Owner**: John McConnell
- **Phone**: (772) 356-3443
- **Email**: info@nearshoreroofingfl.com
- **Address**: 926 18th Pl SW, Vero Beach, FL 32962
- **Hours**: Mon-Fri 8AM-5PM | Sat By Appt.
- **Original site**: https://nearshoreroofingfl.com

## Theme
- **Primary**: Ocean blue HSL `199 89% 48%` (#0EA5E9)
- **Accent**: Deep coastal blue HSL `199 89% 38%` (#0284C7)
- Coastal Florida palette applied across `index.html`, `artifacts/trades-template/src/config.ts`, both index.css files, and the admin/portal pages.

## Stack
pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

- **Monorepo tool**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
