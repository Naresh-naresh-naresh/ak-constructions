import { getSupabase, PACKAGES_TABLE } from "@/lib/supabase";
import type {
  CreatePackageInput,
  PackageRecord,
  PublicPackage,
  UpdatePackageInput,
} from "@/types/package";

/**
 * Same two conventions as `projects.ts`, for the same reasons:
 *
 * - Quoted camelCase columns ("ratePerSqFt", "displayOrder") so rows map 1:1
 *   onto PackageRecord with no mapper. Hand-written SQL must quote them.
 * - supabase-js does NOT throw on failure; it returns { data: null, error }.
 *   Every function checks `error` and throws, so the API routes can answer 503.
 *   Never swallow an error into an empty array — a database outage would then
 *   render as "no packages yet" and silently erase the section from the site.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Admin view: every package, published or not. */
export async function listPackages(): Promise<PackageRecord[]> {
  const { data, error } = await getSupabase()
    .from(PACKAGES_TABLE)
    .select("*")
    .order("displayOrder", { ascending: true })
    .order("createdAt", { ascending: true });

  if (error) throw new Error(`listPackages failed: ${error.message}`);
  return (data ?? []) as PackageRecord[];
}

/**
 * Public view. Filtered in the query rather than in JS so an unpublished
 * package never leaves the database, and projected down to PublicPackage so
 * admin-only fields can't reach the page props.
 */
export async function listPublishedPackages(): Promise<PublicPackage[]> {
  const { data, error } = await getSupabase()
    .from(PACKAGES_TABLE)
    .select('id,name,"ratePerSqFt",summary,highlight,categories')
    .eq("published", true)
    .order("displayOrder", { ascending: true })
    .order("createdAt", { ascending: true });

  if (error) throw new Error(`listPublishedPackages failed: ${error.message}`);
  return (data ?? []) as PublicPackage[];
}

export async function getPackage(id: string): Promise<PackageRecord | null> {
  // Guard non-UUID ids: Postgres raises 22P02, which the route would turn into
  // a 503 instead of the correct 404.
  if (!UUID_RE.test(id)) return null;

  const { data, error } = await getSupabase()
    .from(PACKAGES_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getPackage failed: ${error.message}`);
  return (data as PackageRecord) ?? null;
}

export async function createPackage(
  input: CreatePackageInput
): Promise<PackageRecord> {
  // New packages start unpublished and empty. Publishing is a deliberate second
  // action, so a tier can't go live with a blank spec sheet by accident.
  const { data, error } = await getSupabase()
    .from(PACKAGES_TABLE)
    .insert({
      name: input.name,
      ratePerSqFt: input.ratePerSqFt,
      summary: input.summary ?? null,
      highlight: false,
      published: false,
      displayOrder: 0,
      categories: [],
    })
    .select()
    .single();

  if (error) throw new Error(`createPackage failed: ${error.message}`);
  return data as PackageRecord;
}

export async function updatePackage(
  id: string,
  patch: UpdatePackageInput
): Promise<PackageRecord | null> {
  if (!UUID_RE.test(id)) return null;

  // Built key by key rather than spreading `patch`, so an unexpected field in
  // the request body can't reach the table.
  const changes: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (patch.name !== undefined) changes.name = patch.name;
  if (patch.ratePerSqFt !== undefined) changes.ratePerSqFt = patch.ratePerSqFt;
  if (patch.summary !== undefined) changes.summary = patch.summary;
  if (patch.highlight !== undefined) changes.highlight = patch.highlight;
  if (patch.published !== undefined) changes.published = patch.published;
  if (patch.displayOrder !== undefined) changes.displayOrder = patch.displayOrder;
  if (patch.categories !== undefined) changes.categories = patch.categories;

  const { data, error } = await getSupabase()
    .from(PACKAGES_TABLE)
    .update(changes)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`updatePackage failed: ${error.message}`);
  return (data as PackageRecord) ?? null;
}

export async function deletePackage(id: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;

  const { error } = await getSupabase()
    .from(PACKAGES_TABLE)
    .delete()
    .eq("id", id);

  if (error) throw new Error(`deletePackage failed: ${error.message}`);
  return true;
}
