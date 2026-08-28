import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/authz";
import { listQuotes } from "@/lib/quotes";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** Lead data is customer PII — admin only, never cached. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: NO_STORE }
    );
  }

  try {
    const quotes = await listQuotes();
    return NextResponse.json({ quotes }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to list quotes:", error);
    return NextResponse.json(
      { error: "Could not load enquiries. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}
