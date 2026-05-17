#!/usr/bin/env node
// ============================================================
//  Cloudflare Pages auto-packager
//
//  Runs as a `postbuild` step inside artifacts/trades-template. After
//  Vite builds the static site to dist/public, this script copies that
//  folder to ~/Desktop/{slug}-cloudflare-pages/ and creates a matching
//  .zip — so the operator can drag-and-drop either one onto Cloudflare
//  Pages → Direct Upload without touching the terminal.
//
//  Useful for:
//    (a) deploying to Cloudflare Pages instead of Vercel
//    (b) sending a client a self-contained demo zip without exposing
//        the GitHub repo
//
//  CI behavior: if ~/Desktop doesn't exist (typical on CI runners),
//  exits silently with code 0. The build is never blocked by this step.
// ============================================================
import { existsSync, statSync, rmSync, mkdirSync, cpSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const CONFIG_JSON = join(PROJECT_ROOT, 'business.config.json');
const DIST_DIR = join(PROJECT_ROOT, 'artifacts/trades-template/dist/public');
const DESKTOP = join(homedir(), 'Desktop');

// CI / headless: no Desktop → silently skip. Build must keep going.
if (!existsSync(DESKTOP) || !statSync(DESKTOP).isDirectory()) {
  process.exit(0);
}

if (!existsSync(DIST_DIR)) {
  console.warn(`⚠ package-for-pages: ${DIST_DIR} not found — skipping (did the build fail?)`);
  process.exit(0);
}

if (!existsSync(CONFIG_JSON)) {
  console.warn(`⚠ package-for-pages: ${CONFIG_JSON} missing — using slug "site"`);
}

const biz = existsSync(CONFIG_JSON)
  ? JSON.parse(readFileSync(CONFIG_JSON, 'utf8'))
  : {};

const slug = slugify(biz.businessName || 'site');
const bundleDir = join(DESKTOP, `${slug}-cloudflare-pages`);
const zipFile = `${bundleDir}.zip`;

// Wipe any previous bundle so renames / removed files don't linger.
if (existsSync(bundleDir)) {
  rmSync(bundleDir, { recursive: true, force: true });
}
if (existsSync(zipFile)) {
  rmSync(zipFile, { force: true });
}

mkdirSync(bundleDir, { recursive: true });
cpSync(DIST_DIR, bundleDir, { recursive: true });

// Create the zip by shelling out to the system `zip` command (present on
// every macOS install + most Linux distros). Run it from inside the
// bundle dir so the archive's top-level entries are the site's files,
// not a nested "{slug}-cloudflare-pages/" folder — Cloudflare's Direct
// Upload prefers flat archives.
const zipResult = spawnSync('zip', ['-rq', zipFile, '.'], {
  cwd: bundleDir,
  stdio: 'inherit',
});

if (zipResult.error || zipResult.status !== 0) {
  console.warn(`⚠ package-for-pages: zip step failed (folder is still usable). ${zipResult.error?.message ?? `exit ${zipResult.status}`}`);
} else {
  console.log(`✓ Cloudflare Pages bundle ready at ~/Desktop/${basename(bundleDir)}/ (folder) and .zip`);
}

// businessName → kebab slug: lowercase, non-alphanumeric → dashes,
// collapse repeats, strip leading/trailing dashes. "Joe's Plumbing!"
// becomes "joe-s-plumbing".
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'site';
}
