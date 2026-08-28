/**
 * Roles and auth provider ids.
 *
 * IMPORTANT: this module must stay dependency-free. `src/middleware.ts` imports
 * it and middleware always runs on the Edge runtime — importing anything that
 * reaches `@/lib/auth` would pull bcryptjs and @supabase/supabase-js into the
 * Edge bundle and break the build.
 */
export type UserRole = "admin" | "client";

export const ADMIN_PROVIDER_ID = "admin-login";
export const CLIENT_PROVIDER_ID = "client-login";

/**
 * Provider id → role. NextAuth sets `account.provider` itself, so this is the
 * authoritative mapping. Anything not listed here yields no role, which every
 * authorization check then denies (fail closed).
 */
export const ROLE_BY_PROVIDER: Record<string, UserRole> = {
  [ADMIN_PROVIDER_ID]: "admin",
  [CLIENT_PROVIDER_ID]: "client",
};
