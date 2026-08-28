import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/authz";
import { createProject, listProjects } from "@/lib/projects";
import type { CreateProjectInput } from "@/types/project";

// Authenticated, per-user data: never let this be prerendered or cached.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** 403 (not 401) for a wrong-role session, so a logged-in client isn't sent into a re-login loop. */
function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: NO_STORE });
}

export async function GET() {
  if (!(await isAdmin())) return forbidden();

  try {
    const projects = await listProjects();
    return NextResponse.json({ projects }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to list projects:", error);
    return NextResponse.json(
      { error: "Could not load projects. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return forbidden();

  const body = (await request.json()) as CreateProjectInput;

  if (!body.clientName || !body.phone || !body.siteLocation || !body.areaSqFt) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400, headers: NO_STORE }
    );
  }

  try {
    const project = await createProject(body);
    return NextResponse.json({ project }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Could not create project. Check the Supabase setup." },
      { status: 503, headers: NO_STORE }
    );
  }
}
