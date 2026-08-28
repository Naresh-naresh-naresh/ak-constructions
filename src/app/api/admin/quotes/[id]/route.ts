import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/authz";
import { updateQuote } from "@/lib/quotes";
import type { QuoteStatus } from "@/types/quote";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: NO_STORE }
    );
  }

  const body = (await request.json()) as {
    status?: QuoteStatus;
    notes?: string;
  };

  try {
    const quote = await updateQuote(params.id, body);
    if (!quote) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404, headers: NO_STORE }
      );
    }
    return NextResponse.json({ quote }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to update quote:", error);
    return NextResponse.json(
      { error: "Could not save changes. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}
