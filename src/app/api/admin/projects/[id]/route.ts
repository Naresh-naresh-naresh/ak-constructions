import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/authz";
import { getProject, updateProject } from "@/lib/projects";
import type { UpdateProjectInput } from "@/types/project";

// Authenticated, per-user data: never let this be prerendered or cached.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** 403 (not 401) for a wrong-role session, so a logged-in client isn't sent into a re-login loop. */
function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: NO_STORE });
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) return forbidden();

  try {
    const project = await getProject(params.id);
    if (!project) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404, headers: NO_STORE }
      );
    }

    return NextResponse.json({ project }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to load project:", error);
    return NextResponse.json(
      { error: "Could not load project. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) return forbidden();

  const body = (await request.json()) as UpdateProjectInput;

  try {
    const project = await updateProject(params.id, body);
    if (!project) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404, headers: NO_STORE }
      );
    }

    return NextResponse.json({ project }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Could not save changes. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}
