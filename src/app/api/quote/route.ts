import { NextResponse } from "next/server";
import { createQuote } from "@/lib/quotes";
import { normalizePhone } from "@/lib/utils";
import type { CreateQuoteInput } from "@/types/quote";

export const dynamic = "force-dynamic";

/**
 * Public quote/enquiry endpoint.
 *
 * Leads are persisted to the database — an earlier version only console.logged
 * them, which meant every enquiry submitted on the live site was silently lost.
 * Deliberately does NOT log the submitted name/phone/email: that would put
 * customer PII into hosting logs for no benefit now that it's stored properly.
 */
export async function POST(request: Request) {
  let body: CreateQuoteInput;
  try {
    body = (await request.json()) as CreateQuoteInput;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");

  if (!body.name?.trim() || phone.length !== 10 || !body.sqFt) {
    return NextResponse.json(
      { error: "Please enter your name, a valid 10-digit mobile number, and area." },
      { status: 400 }
    );
  }

  try {
    await createQuote({ ...body, phone });

    return NextResponse.json({
      success: true,
      message: "Quote request received",
    });
  } catch (error) {
    // No PII in the log line — just enough to know a write failed.
    console.error("Failed to save quote request:", error);
    return NextResponse.json(
      {
        error:
          "We couldn't submit your request just now. Please call or WhatsApp us instead.",
      },
      { status: 503 }
    );
  }
}
