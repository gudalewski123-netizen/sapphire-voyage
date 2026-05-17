#!/usr/bin/env node
// ============================================================
//  Auto-deploys dist/public to Vercel as a preview, prints the URL.
//  Skips silently if VERCEL_TOKEN isn't set (CI environments, etc.).
//
//  Runs as the LAST postbuild step in artifacts/trades-template, after
//  package-for-pages.mjs builds the Cloudflare bundle. The Cloudflare
//  bundle is the offline-safe backup; this script gets a live preview
//  URL the operator can hand to a client for design approval before
//  the production domain is wired up.
// ============================================================
import { readFile, access } from "node:fs/promises";
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = `${ROOT}/artifacts/trades-template/dist/public`;
const CONFIG_JSON = `${ROOT}/business.config.json`;

const token = process.env.VERCEL_TOKEN;
if (!token || token.length < 10) {
  console.log("\n⚠ VERCEL_TOKEN not set — skipping Vercel preview deploy.");
  console.log("  Set in your shell: export VERCEL_TOKEN=vcp_xxx\n");
  process.exit(0);
}

try {
  await access(DIST);
} catch {
  console.error(`✗ Build output not found at ${DIST}. Run the Vite build first.`);
  process.exit(1);
}

const biz = JSON.parse(await readFile(CONFIG_JSON, "utf8"));
const slug = (biz.businessName || "client")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const projectName = `${slug}-demo`;

console.log(`\n→ Deploying ${projectName} to Vercel preview...\n`);

let stdout;
try {
  stdout = execSync(
    `npx --yes vercel@latest deploy "${DIST}" --token="${token}" --yes --name "${projectName}"`,
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }
  );
} catch (err) {
  console.error("✗ Vercel deploy failed. See output above.");
  process.exit(1);
}

const match = stdout.match(/https:\/\/[a-z0-9-]+\.vercel\.app/i);
const url = match ? match[0] : stdout.trim().split("\n").pop();

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("✅ Vercel preview deploy live:");
console.log(`   ${url}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Share this URL with the client for design approval.");
console.log("For production, push to GitHub — Vercel auto-deploys the real domain.\n");
