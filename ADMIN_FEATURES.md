# ADMIN_FEATURES.md — Required `/admin` feature set

This document is the **canonical spec** for the admin page that ships with every Tier 1 and Tier 2 client fork. Future Claude sessions modifying `artifacts/trades-template/src/pages/AdminPage.tsx` (or the backend admin routes in `artifacts/api-server/`) **must preserve every feature listed here**. Removing one is a regression.

The same spec applies to **both Tier 1 and Tier 2** templates. This file is mirrored byte-identical between them — if you change it in one, mirror it to the other.

---

## 1. Lead capture (public landing page)

- The public-facing quote form (`QuoteForm` in `App.tsx`) MUST submit in parallel to:
  1. `POST /api/leads` → persists the lead to the Postgres `leads` table (source of truth for the dashboard)
  2. `POST https://formsubmit.co/<BUSINESS.email>` → email notification to the operator
- If the backend is down, the FormSubmit email still goes out — no lost leads.
- Fields collected: `name`, `phone`, `email`, `service` (optional), `message` (optional).
- All new leads default to status `new`.

## 2. JWT-protected admin auth

- Login at `/admin` accepts username + password.
- Factory default credentials: `Admin` / `Password` — only active while `admin_users` is empty.
- Once the operator rotates credentials in the Account tab, the defaults stop working.
- Backend issues a JWT signed with `SESSION_SECRET`, valid for 7 days.
- Frontend stores the token in `localStorage` (`admin_token`) and sends it as `Authorization: Bearer <token>` on every protected request.
- A sticky orange banner appears post-login while `admin_users` is empty, prompting credential rotation.
- "Sign out" clears localStorage and returns to the login screen.
- `ADMIN_PASSWORD` env var on Render is a break-glass override: any username + this password is accepted regardless of DB state.

Required endpoints (Express, in `artifacts/api-server/src/routes/admin.ts`):

- `POST /api/admin/login` → `{ token, username }`
- `GET  /api/admin/me` → `{ username, isDefault }`
- `POST /api/admin/credentials` → rotate username + password
- `GET  /api/admin/leads` → list leads, newest first
- `PATCH /api/admin/leads/:id` → update `status` or `adminNotes`
- `DELETE /api/admin/leads/:id` → hard delete

## 3. Leads dashboard (default tab)

- Table view of all leads with columns: date, name, service, phone, status badge.
- Row click expands inline panel with: full message, tel:/mailto: links, status dropdown, internal notes textarea (autosaves on blur), delete button.
- Statuses are exactly: `new`, `contacted`, `won`, `lost`. Color-coded badges (blue, yellow, emerald, red).
- "Refresh" button reloads from `/api/admin/leads`.
- Empty state explains where leads come from.
- Loading state shown while the initial fetch is in flight.
- Network/auth errors are surfaced in a banner — never silently swallowed.

## 4. Status filter pills

- Filter pills above the table: `all` · `new` · `contacted` · `won` · `lost`.
- Each non-`all` pill shows the count of leads in that status: `new (5)`.
- The active pill is visually distinguished (filled in primary color).
- Filter state is component-local — does not need to persist across reloads.

## 5. CSV + PDF lead export (Download button)

A "Download" button MUST appear in the leads toolbar (next to the status filter pills). Clicking it opens a modal with:

**Format checkboxes** (both pre-checked):
- `[✓] PDF` — printable, branded
- `[✓] CSV` — opens in Excel / Sheets

**Scope radio** (default: filtered if a status filter is active, else all):
- `○ All leads`
- `● Currently-filtered`

**Buttons:** Cancel · Download.

### CSV requirements

- Columns, in order: `Date | Name | Email | Phone | Service | Message | Status | Notes`.
- RFC 4180 escaping: wrap any field containing comma, double quote, CR, or LF in double quotes; double up any embedded quotes.
- Records separated by CRLF (`\r\n`).
- UTF-8 encoding, with BOM prefix so Excel renders accented characters correctly.
- Triggered via `Blob` + temporary `<a download>` tag (no server round-trip).
- Filename: `{slug}-leads-{yyyy-mm-dd}.csv`

### PDF requirements

- Generated with `jspdf` + `jspdf-autotable` (both must be `import()`ed dynamically so they are code-split out of the main bundle — they only load when the user clicks Download).
- Landscape letter format.
- Page header: `BUSINESS.name` (bold), "Leads Export" subtitle, today's date (right-aligned), active filter label (right-aligned).
- Same columns as CSV.
- Footer on every page: `Total leads: N  •  Filter: <label>` (left) and `Page X` (right).
- Filename: `{slug}-leads-{yyyy-mm-dd}.pdf`

### Slug derivation

`slugify(BUSINESS.name)` — lowercase, spaces → dashes, strip everything not `[a-z0-9-]`, collapse repeated dashes, trim leading/trailing dashes. Empty input → `"leads"`.

### Both formats checked

Both downloads MUST trigger sequentially in the same user gesture (one click → two files in the browser's Downloads folder).

### Empty / invalid states

- If both format checkboxes are unchecked → inline error "Pick at least one format."
- If the selected scope contains zero leads → inline error "Nothing to export — the selected scope has zero leads."
- Download button is disabled while the leads list is empty or still loading.

### Success toast

After a successful download, the modal closes and a brief toast appears: `Downloaded X leads` (auto-dismisses after ~3 seconds).

## 6. Account tab — credential rotation

- Tab switcher in the header: `Leads` · `Account`.
- Account tab form: current password + new username (≥3 chars) + new password (≥8 chars) + confirm.
- Backend replaces the `admin_users` row atomically (DELETE + INSERT in a transaction); passwords bcrypt-hashed at cost 12.
- After successful rotation, the operator is signed out and returned to the login screen with a confirmation message.
- Validation errors are surfaced inline; the form never silently fails.

---

## Implementation notes for future Claude sessions

- The admin page is **one self-contained file**: `artifacts/trades-template/src/pages/AdminPage.tsx`. Keep it that way — do not extract into a sprawling `admin/` folder unless there's a real reason. Easier to keep in sync across forks.
- Color tokens come from `THEME` in `src/config.ts` via CSS vars set in the top-level `useEffect`. Do not hard-code brand colors.
- `BUSINESS.name` and `BUSINESS.shortName` come from `src/config.ts` (synced from `business.config.json`). Always read from `config.ts`, never inline business strings.
- `jspdf` is large (~350 kB raw, ~115 kB gzipped). It MUST stay behind `import()` so it does not bloat the initial bundle. Static imports are a regression.
- The factory `Admin` / `Password` login is a security tradeoff for onboarding ergonomics — the orange banner exists specifically to force rotation. Do not remove the banner without an equivalent forcing mechanism.
- When adding a NEW required feature, update this file FIRST, then implement, then mirror this file to the other tier template.
