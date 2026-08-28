import { randomUUID } from "node:crypto";
import { STAGE_TEMPLATE } from "@/config/stages";
import { getSupabase, PROJECTS_TABLE } from "@/lib/supabase";
import { normalizePhone } from "@/lib/utils";
import type {
  ConstructionStage,
  CreateProjectInput,
  ProjectRecord,
  UpdateProjectInput,
} from "@/types/project";

/**
 * NOTE ON COLUMN NAMING: the `projects` table intentionally uses quoted
 * camelCase columns ("clientName", "areaSqFt", ...) rather than Postgres'
 * conventional snake_case, so rows map 1:1 onto ProjectRecord with no mapper
 * layer. Please don't "fix" this to snake_case without adding that mapping.
 * Consequence: any hand-written SQL must quote those identifiers, or Postgres
 * folds them to lowercase and errors.
 *
 * NOTE ON ERRORS: supabase-js does NOT throw on query failure — it returns
 * { data: null, error }. The API routes calling this module rely on thrown
 * errors to return 503. So every function below checks `error` and throws.
 * Never swallow an error into an empty array/null, or a database outage would
 * surface to users as "No projects yet" / "No project found for this number".
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function calculateProgressPercent(stages: ConstructionStage[]): number {
  if (stages.length === 0) return 0;
  const completedCount = stages.filter((stage) => stage.completed).length;
  return Math.round((completedCount / stages.length) * 100);
}

export async function listProjects(): Promise<ProjectRecord[]> {
  const { data, error } = await getSupabase()
    .from(PROJECTS_TABLE)
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) throw new Error(`listProjects failed: ${error.message}`);
  return (data ?? []) as ProjectRecord[];
}

export async function getProject(id: string): Promise<ProjectRecord | null> {
  // Guard non-UUID ids: Postgres would raise 22P02, which the route would turn
  // into a 503 instead of the correct 404.
  if (!UUID_RE.test(id)) return null;

  const { data, error } = await getSupabase()
    .from(PROJECTS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getProject failed: ${error.message}`);
  return (data as ProjectRecord | null) ?? null;
}

export async function getProjectsByPhone(
  phone: string
): Promise<ProjectRecord[]> {
  const { data, error } = await getSupabase()
    .from(PROJECTS_TABLE)
    .select("*")
    .eq("phone", normalizePhone(phone))
    .order("createdAt", { ascending: false });

  if (error) throw new Error(`getProjectsByPhone failed: ${error.message}`);
  return (data ?? []) as ProjectRecord[];
}

export async function createProject(
  input: CreateProjectInput
): Promise<ProjectRecord> {
  const now = new Date().toISOString();
  const project: ProjectRecord = {
    id: randomUUID(),
    clientName: input.clientName,
    phone: normalizePhone(input.phone),
    siteLocation: input.siteLocation,
    areaSqFt: input.areaSqFt,
    floors: input.floors,
    startedOn: input.startedOn,
    status: "on_schedule",
    stages: STAGE_TEMPLATE.map((stage) => ({
      key: stage.key,
      label: stage.label,
      completed: false,
    })),
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await getSupabase().from(PROJECTS_TABLE).insert(project);

  if (error) throw new Error(`createProject failed: ${error.message}`);
  return project;
}

export async function recordProjectCheck(id: string): Promise<void> {
  if (!UUID_RE.test(id)) return;

  // An RPC rather than .update(): PostgREST cannot express `checkCount + 1`,
  // and a read-then-write would lose concurrent increments.
  const { error } = await getSupabase().rpc("increment_project_check", {
    project_id: id,
  });

  if (error) throw new Error(`recordProjectCheck failed: ${error.message}`);
}

export async function updateProject(
  id: string,
  patch: UpdateProjectInput
): Promise<ProjectRecord | null> {
  if (!UUID_RE.test(id)) return null;

  // Built conditionally: a blind spread would null out columns the patch omits.
  const changes: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  if (patch.status !== undefined) changes.status = patch.status;
  if (patch.stages !== undefined) changes.stages = patch.stages;
  if (patch.notes !== undefined) changes.notes = patch.notes;

  const { data, error } = await getSupabase()
    .from(PROJECTS_TABLE)
    .update(changes)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`updateProject failed: ${error.message}`);
  // 0 rows matched → project doesn't exist → let the route return 404.
  return (data as ProjectRecord | null) ?? null;
}
