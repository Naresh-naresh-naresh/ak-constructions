import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/authz";
import { deletePackage, getPackage, updatePackage } from "@/lib/packages";
import type { UpdatePackageInput } from "@/types/package";

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

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) return forbidden();

  try {
    const pkg = await getPackage(params.id);
    if (!pkg) return notFound();
    return NextResponse.json({ package: pkg }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to load package:", error);
    return NextResponse.json(
      { error: "Could not load the package. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) return forbidden();

  const body = (await request.json()) as UpdatePackageInput;

  // Validate only the fields actually present — this endpoint takes partial
  // patches (publish toggle, a renamed category, a whole new spec list).
  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json(
      { error: "Package name cannot be empty." },
      { status: 400, headers: NO_STORE }
    );
  }
  if (
    body.ratePerSqFt !== undefined &&
    (!Number.isFinite(Number(body.ratePerSqFt)) || Number(body.ratePerSqFt) < 0)
  ) {
    return NextResponse.json(
      { error: "Rate must be a number, 0 or more." },
      { status: 400, headers: NO_STORE }
    );
  }

  try {
    const updated = await updatePackage(params.id, body);
    if (!updated) return notFound();

    refreshHomepage();
    return NextResponse.json({ package: updated }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to update package:", error);
    return NextResponse.json(
      { error: "Could not save changes. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) return forbidden();

  try {
    // Confirm it exists first, so deleting an already-deleted package reports
    // 404 rather than a misleading success.
    const existing = await getPackage(params.id);
    if (!existing) return notFound();

    await deletePackage(params.id);

    refreshHomepage();
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to delete package:", error);
    return NextResponse.json(
      { error: "Could not delete the package. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}
