import { redirect } from "next/navigation";
import SignOutButton from "@/app/track/SignOutButton";
import StageChecklist from "@/components/StageChecklist";
import StatusBadge from "@/components/StatusBadge";
import { clientConfig } from "@/config/client";
import { requireClientPhone } from "@/lib/authz";
import {
  calculateProgressPercent,
  getProjectsByPhone,
  recordProjectCheck,
} from "@/lib/projects";
import { buildWhatsAppUrl } from "@/lib/utils";
import type { ClientProjectStatus } from "@/types/project";

/**
 * Client dashboard — a Server Component on purpose.
 *
 * Reading the session and querying directly here means there is no per-user GET
 * API route to accidentally cache (the classic App Router auth bug), no
 * client-side fetch, and no way to pass someone else's phone number: the phone
 * comes only from the session.
 */
export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const phone = await requireClientPhone();
  // Middleware already guards this path; this is defence in depth in case the
  // matcher is ever changed.
  if (!phone) redirect("/login");

  let projects: ClientProjectStatus[] = [];
  let loadFailed = false;

  try {
    const records = await getProjectsByPhone(phone);

    projects = records.map((project) => ({
      clientName: project.clientName,
      siteLocation: project.siteLocation,
      areaSqFt: project.areaSqFt,
      floors: project.floors,
      startedOn: project.startedOn,
      status: project.status,
      stages: project.stages,
      progressPercent: calculateProgressPercent(project.stages),
    }));

    // Best-effort: a logging failure must never break the dashboard.
    try {
      await Promise.all(records.map((project) => recordProjectCheck(project.id)));
    } catch (error) {
      console.error("Failed to record project check:", error);
    }
  } catch (error) {
    console.error("Failed to load client projects:", error);
    loadFailed = true;
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Client Dashboard</h1>
            <p className="mt-1 text-sm text-stone-500">{phone}</p>
          </div>
          <SignOutButton />
        </div>

        {loadFailed && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            We couldn&apos;t load your project just now. Please refresh in a
            moment.
          </p>
        )}

        {!loadFailed && projects.length === 0 && (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-600">
              No project is linked to this number yet.
            </p>
            <a
              href={buildWhatsAppUrl(
                clientConfig.whatsapp,
                `Hi ${clientConfig.name}, I've logged in but can't see my project.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-orange-600 hover:underline"
            >
              Message us on WhatsApp →
            </a>
          </div>
        )}

        {projects.map((project, index) => (
          <div
            key={index}
            className="mt-6 rounded-2xl border border-stone-200 bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
              Project Status
            </p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">{project.clientName}</p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {project.siteLocation} · {project.areaSqFt.toLocaleString("en-IN")} sq ft · {project.floors}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">
                  Started {project.startedOn}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-stone-400">
              {project.progressPercent}% complete
            </p>

            <div className="mt-4">
              <StageChecklist stages={project.stages} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
