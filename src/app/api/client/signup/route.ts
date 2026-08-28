import { NextResponse } from "next/server";
import {
  clientAccountExists,
  createClientAccount,
  validatePassword,
} from "@/lib/client-accounts";
import { isValidSignupCode } from "@/lib/projects";
import { normalizePhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

type SignupBody = {
  phone?: string;
  code?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: NO_STORE }
    );
  }

  const phone = normalizePhone(body.phone ?? "");
  const code = (body.code ?? "").trim();
  const password = body.password ?? "";

  if (phone.length !== 10) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit mobile number" },
      { status: 400, headers: NO_STORE }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Enter the invite code we sent you" },
      { status: 400, headers: NO_STORE }
    );
  }

  const passwordProblem = validatePassword(password, phone);
  if (passwordProblem) {
    return NextResponse.json(
      { error: passwordProblem },
      { status: 400, headers: NO_STORE }
    );
  }

  try {
    // The invite code is the real gate. Because it's a secret the admin issued,
    // we can afford clear, specific error messages here without turning signup
    // into a project-enumeration oracle.
    if (!(await isValidSignupCode(phone, code))) {
      return NextResponse.json(
        {
          error:
            "That mobile number and invite code don't match. Please check the code we sent you.",
        },
        { status: 400, headers: NO_STORE }
      );
    }

    if (await clientAccountExists(phone)) {
      return NextResponse.json(
        { error: "An account already exists for this number. Please log in instead." },
        { status: 409, headers: NO_STORE }
      );
    }

    const result = await createClientAccount(phone, password);

    // Lost the insert race against a concurrent signup — same outcome as above.
    if (!result.ok) {
      return NextResponse.json(
        { error: "An account already exists for this number. Please log in instead." },
        { status: 409, headers: NO_STORE }
      );
    }

    return NextResponse.json({ success: true }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("Client signup failed:", error);
    return NextResponse.json(
      { error: "Could not create your account right now. Please try again shortly." },
      { status: 503, headers: NO_STORE }
    );
  }
}
