/** Read admin credentials from runtime env (bracket access avoids Next.js build-time inlining). */
export function getAdminUsername(): string | undefined {
  return process.env["ADMIN_USERNAME"]?.trim();
}

/**
 * Prefer ADMIN_PASSWORD_HASH_B64 on Amplify — bcrypt hashes contain `$` which
 * Amplify's build shell strips when writing .env.production via echo.
 */
export function getAdminPasswordHash(): string | undefined {
  const b64 = process.env["ADMIN_PASSWORD_HASH_B64"]?.trim();
  if (b64) {
    return Buffer.from(b64, "base64").toString("utf8").trim();
  }
  return process.env["ADMIN_PASSWORD_HASH"]?.trim();
}
