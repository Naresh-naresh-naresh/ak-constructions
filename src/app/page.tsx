import HomePage from "@/components/HomePage";
import { listPublishedPackages } from "@/lib/packages";
import type { PublicPackage } from "@/types/package";

/**
 * Cached and revalidated rather than dynamic. The homepage is the lead-generating
 * page, packages change rarely, and this keeps it fast without a database round
 * trip per visitor. Admin edits don't wait for the window to expire — the
 * package routes call revalidatePath("/") so a change is live immediately.
 */
export const revalidate = 600;

export default async function Home() {
  // A database outage must never take down the homepage. Falling back to an
  // empty list hides the packages section and leaves the quote form — which is
  // the part that actually earns money — working.
  let packages: PublicPackage[] = [];
  try {
    packages = await listPublishedPackages();
  } catch (error) {
    console.error("Failed to load packages for the homepage:", error);
  }

  return <HomePage packages={packages} />;
}
