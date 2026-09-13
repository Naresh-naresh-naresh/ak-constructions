import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/authz";
import { createPackage, listPackages } from "@/lib/packages";
import type { CreatePackageInput } from "@/types/package";

// Authenticated admin data: never prerendered or cached.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** 403 (not 401) for a wrong-role session, so a logged-in client isn't sent into a re-login loop. */
function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: NO_STORE });
}

/**
 * The homepage caches published packages (see `revalidate` in app/page.tsx), so
 * every write here must bust that cache or an edit appears to do nothing for up
 * to ten minutes — which reads as a broken admin page.
 */
function refreshHomepage() {
  revalidatePath("/");
}

export async function GET() {
  if (!(await isAdmin())) return forbidden();

  try {
    const packages = await listPackages();
    return NextResponse.json({ packages }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to list packages:", error);
    return NextResponse.json(
      { error: "Could not load packages. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return forbidden();

  const body = (await request.json()) as CreatePackageInput;
  const name = body.name?.trim();
  const rate = Number(body.ratePerSqFt);

  // A package with no name or a nonsense rate would render as a broken card on
  // the public site, so reject it here rather than letting it reach the table.
  if (!name) {
    return NextResponse.json(
      { error: "Package name is required." },
      { status: 400, headers: NO_STORE }
    );
  }
  if (!Number.isFinite(rate) || rate < 0) {
    return NextResponse.json(
      { error: "Rate must be a number, 0 or more." },
      { status: 400, headers: NO_STORE }
    );
  }

  try {
    const created = await createPackage({
      name,
      ratePerSqFt: Math.round(rate),
      summary: body.summary?.trim() || undefined,
    });
    refreshHomepage();
    return NextResponse.json({ package: created }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("Failed to create package:", error);
    return NextResponse.json(
      { error: "Could not create the package. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}
