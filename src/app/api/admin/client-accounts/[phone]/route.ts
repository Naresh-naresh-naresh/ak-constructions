import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/authz";
import { deleteClientAccount } from "@/lib/client-accounts";
import { regenerateSignupCodes } from "@/lib/projects";
import { normalizePhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Resets a client's login: deletes their account so they can register again,
 * and issues a fresh invite code so the old one can't be replayed.
 *
 * This is the only recovery path for a forgotten password or a hijacked
 * account, so it must stay admin-gated.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { phone: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: NO_STORE }
    );
  }

  const phone = normalizePhone(params.phone);
  if (phone.length !== 10) {
    return NextResponse.json(
      { error: "Invalid phone number" },
      { status: 400, headers: NO_STORE }
    );
  }

  try {
    await deleteClientAccount(phone);
    await regenerateSignupCodes(phone);
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to reset client login:", error);
    return NextResponse.json(
      { error: "Could not reset the client login. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}
