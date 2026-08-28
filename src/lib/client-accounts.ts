import "server-only";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { normalizePhone } from "@/lib/utils";

/**
 * The ONLY module that touches the client_accounts table.
 *
 * It deliberately never returns a row or a password hash — callers get booleans
 * and small value objects — so no route handler can accidentally serialize
 * "passwordHash" into a response. Never use select("*") here.
 *
 * Error convention matches src/lib/projects.ts: supabase-js returns
 * { data, error } rather than throwing, so every call checks `error` and throws.
 * Swallowing an error would render a database outage as "wrong password".
 *
 * Column names are quoted camelCase to match the rest of the schema.
 */

const CLIENT_ACCOUNTS_TABLE = "client_accounts";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const BCRYPT_COST = 10;

/**
 * A throwaway hash compared against when no account exists, so the response
 * time of "unknown phone" matches "wrong password" rather than returning
 * noticeably faster and revealing which numbers have accounts.
 *
 * Generated from random bytes rather than hardcoded — nothing can authenticate
 * against it, and the only property that matters is that it's a *valid* bcrypt
 * hash at the same cost factor, so bcrypt.compare does the full amount of work.
 * (A malformed string would return false immediately and defeat the purpose.)
 *
 * Built lazily and cached: paying ~100ms once per process, only on the first
 * unknown-phone attempt, is cheaper than doing it on every cold start.
 */
let dummyHash: string | null = null;

async function getDummyHash(): Promise<string> {
  if (!dummyHash) {
    dummyHash = await bcrypt.hash(randomBytes(32).toString("hex"), BCRYPT_COST);
  }
  return dummyHash;
}

export const PASSWORD_MIN_LENGTH = 10;
/** bcrypt silently ignores anything past 72 bytes, so reject rather than truncate. */
export const PASSWORD_MAX_BYTES = 72;

export type PasswordProblem = string | null;

/** Server-side authoritative password policy. Returns null when acceptable. */
export function validatePassword(password: string, phone: string): PasswordProblem {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    return "Password is too long. Please use a shorter one.";
  }
  const normalized = normalizePhone(phone);
  if (normalized && password.includes(normalized)) {
    return "Password must not contain your mobile number.";
  }
  return null;
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "locked"; lockedUntil: string };

/**
 * Verifies a client's password, maintaining the lockout counter.
 * Returns a coarse result — never the stored hash.
 */
export async function verifyClientPassword(
  phone: string,
  password: string
): Promise<VerifyResult> {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return { ok: false, reason: "invalid" };

  const { data, error } = await getSupabase()
    .from(CLIENT_ACCOUNTS_TABLE)
    .select('phone, "passwordHash", "failedAttempts", "lockedUntil"')
    .eq("phone", normalized)
    .maybeSingle();

  if (error) throw new Error(`verifyClientPassword failed: ${error.message}`);

  if (!data) {
    // Equalize timing with the wrong-password path.
    await bcrypt.compare(password, await getDummyHash());
    return { ok: false, reason: "invalid" };
  }

  const account = data as {
    phone: string;
    passwordHash: string;
    failedAttempts: number;
    lockedUntil: string | null;
  };

  if (account.lockedUntil && new Date(account.lockedUntil) > new Date()) {
    return { ok: false, reason: "locked", lockedUntil: account.lockedUntil };
  }

  const matches = await bcrypt.compare(password, account.passwordHash);

  if (!matches) {
    const attempts = account.failedAttempts + 1;
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
    const { error: failError } = await getSupabase()
      .from(CLIENT_ACCOUNTS_TABLE)
      .update({
        failedAttempts: attempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString()
          : null,
      })
      .eq("phone", normalized);
    if (failError) {
      throw new Error(`verifyClientPassword failed: ${failError.message}`);
    }
    return { ok: false, reason: "invalid" };
  }

  const { error: successError } = await getSupabase()
    .from(CLIENT_ACCOUNTS_TABLE)
    .update({
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date().toISOString(),
    })
    .eq("phone", normalized);
  if (successError) {
    throw new Error(`verifyClientPassword failed: ${successError.message}`);
  }

  return { ok: true };
}

export type CreateAccountResult =
  | { ok: true }
  | { ok: false; reason: "exists" };

/**
 * Creates an account. Relies on the primary key for atomicity rather than a
 * check-then-insert, which would race: Postgres 23505 (unique violation) is
 * translated to "exists" instead of bubbling up as a 503.
 */
export async function createClientAccount(
  phone: string,
  password: string
): Promise<CreateAccountResult> {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) {
    throw new Error("createClientAccount called with an invalid phone");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  const { error } = await getSupabase()
    .from(CLIENT_ACCOUNTS_TABLE)
    .insert({ phone: normalized, passwordHash });

  if (error) {
    if (error.code === "23505") return { ok: false, reason: "exists" };
    throw new Error(`createClientAccount failed: ${error.message}`);
  }

  return { ok: true };
}

export async function clientAccountExists(phone: string): Promise<boolean> {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return false;

  const { data, error } = await getSupabase()
    .from(CLIENT_ACCOUNTS_TABLE)
    .select("phone")
    .eq("phone", normalized)
    .maybeSingle();

  if (error) throw new Error(`clientAccountExists failed: ${error.message}`);
  return Boolean(data);
}

/** Used by the admin "Reset client login" action so the client can re-register. */
export async function deleteClientAccount(phone: string): Promise<void> {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) {
    throw new Error("deleteClientAccount called with an invalid phone");
  }

  const { error } = await getSupabase()
    .from(CLIENT_ACCOUNTS_TABLE)
    .delete()
    .eq("phone", normalized);

  if (error) throw new Error(`deleteClientAccount failed: ${error.message}`);
}
