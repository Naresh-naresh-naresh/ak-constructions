/**
 * Export every table to a timestamped JSON file.
 *
 * Why this exists: the code is safe in GitHub and the env vars are safe in
 * Vercel, but the DATABASE is the one thing with a single copy. Project stages,
 * client logins and every lead live only in Supabase. If that account is lost,
 * suspended, or the project is deleted, none of it is recoverable — and unlike
 * the code, it cannot be rebuilt from memory.
 *
 * Free-tier Supabase has no point-in-time recovery, so this is the backup.
 *
 * Usage:
 *   node scripts/export-database.mjs [output-dir]
 *
 * The output CONTAINS bcrypt password hashes for client logins and every
 * customer's phone number. Encrypt it and store it in a password manager.
 * Do not put it in Drive, email or a chat.
 */

import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, sep } from "node:path";

// Every table the app writes to. Add to this list when a table is added, or the
// backup silently stops being complete — which is the worst kind of backup.
const TABLES = ["projects", "client_accounts", "packages", "quotes"];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with the env file loaded:\n" +
      "  set -a; . ./.env.local; set +a; node scripts/export-database.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const stamp = new Date().toISOString().slice(0, 10);

// The output directory is operator-supplied, so resolve it to an absolute path
// once and confine every write beneath it. Nothing here is reachable from a
// request — this is a local CLI and the caller could write files directly
// anyway — but the containment check keeps that true if the script is ever
// wired into a cron or CI job where the path is not typed by a human.
const dir = resolve(process.argv[2] ?? ".", `ak-db-backup-${stamp}`);
mkdirSync(dir, { recursive: true });

/**
 * Write one file inside the backup directory.
 *
 * `name` is always a hardcoded table name or "manifest.json", and the prefix
 * check is what makes that an enforced guarantee rather than an assumption a
 * later edit could quietly break.
 */
function writeInsideBackup(name, contents) {
  const target = resolve(dir, name);
  if (target !== dir && !target.startsWith(dir + sep)) {
    throw new Error(`Refusing to write outside the backup directory: ${name}`);
  }
  writeFileSync(target, contents);
}

let failed = false;
const manifest = { exportedAt: new Date().toISOString(), tables: {} };

for (const table of TABLES) {
  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    // Report and keep going: a missing table shouldn't cost you the tables that
    // do exist. But exit non-zero at the end so a cron or wrapper notices.
    console.error(`  ${table.padEnd(16)} FAILED — ${error.message}`);
    manifest.tables[table] = { error: error.message };
    failed = true;
    continue;
  }

  writeInsideBackup(`${table}.json`, JSON.stringify(data, null, 2));
  console.log(`  ${table.padEnd(16)} ${data.length} rows`);
  manifest.tables[table] = { rows: data.length };
}

writeInsideBackup("manifest.json", JSON.stringify(manifest, null, 2));

console.log(`\nWritten to ${dir}`);
console.log("\nThis contains password hashes and customer phone numbers.");
console.log("Encrypt it before it goes anywhere:");
console.log(`  zip -er ${dir}.zip ${dir} && rm -rf ${dir}`);

process.exit(failed ? 1 : 0);
