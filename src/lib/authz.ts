import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";

/**
 * Central authorization helpers.
 *
 * Every check is written as "must EQUAL the expected role" so a token without a
 * role claim (issued before this feature shipped) is denied rather than allowed.
 * Centralized on purpose: hand-rolling the same comparison in six handlers is
 * how one of them ends up missing it.
 *
 * Note middleware cannot protect API routes — its matcher covers pages only —
 * so these helpers are the ONLY authorization boundary for /api/*.
 */

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

/**
 * Returns the authenticated client's normalized phone, or null.
 * The phone comes exclusively from the session — never from a request
 * parameter — so a logged-in client cannot read another client's project.
 */
export async function requireClientPhone(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "client") return null;

  const phone = normalizePhone(session.user.phone ?? "");
  return phone.length === 10 ? phone : null;
}
