import { NextResponse } from "next/server";
import { clientConfig } from "@/config/client";
import { formatIndianCurrency } from "@/lib/utils";
import type { QuoteFormData } from "@/types/quote";

type QuoteRequestBody = QuoteFormData & {
  estimate: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuoteRequestBody;

    if (!body.name || !body.phone || !body.sqFt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const leadSummary = {
      client: clientConfig.name,
      receivedAt: new Date().toISOString(),
      lead: {
        name: body.name,
        phone: body.phone,
        email: body.email || "Not provided",
        city: body.city,
        bhk: body.bhk,
        sqFt: body.sqFt,
        workType: body.workType,
        timeline: body.timeline,
        estimate: formatIndianCurrency(body.estimate),
      },
    };

    // v1: log to server console. Replace with SES email or Google Sheets webhook.
    console.log("New quote request:", JSON.stringify(leadSummary, null, 2));

    return NextResponse.json({
      success: true,
      message: "Quote request received",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 500 }
    );
  }
}
