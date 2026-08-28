/** Read admin credentials from runtime env (bracket access avoids Next.js build-time inlining). */
export function getAdminUsername(): string | undefined {
  return process.env["ADMIN_USERNAME"]?.trim();
}

/**
 * Supports a base64-encoded hash as well as the plain one.
 *
 * Why: a bcrypt hash contains `$` (e.g. `$2b$10$...`), and Next.js runs
 * dotenv-expand over `.env.local`, which mangles it unless every `$` is escaped
 * as `\$`. Setting ADMIN_PASSWORD_HASH_B64 avoids that footgun entirely. Hosts
 * that inject env vars directly (Vercel) can use the plain ADMIN_PASSWORD_HASH.
 *
 * Set only ONE of the two per environment — the B64 branch wins unconditionally,
 * so a stale B64 value would silently override a correct plain hash.
 */
export function getAdminPasswordHash(): string | undefined {
  const b64 = process.env["ADMIN_PASSWORD_HASH_B64"]?.trim();
  if (b64) {
    return Buffer.from(b64, "base64").toString("utf8").trim();
  }
  return process.env["ADMIN_PASSWORD_HASH"]?.trim();
}
