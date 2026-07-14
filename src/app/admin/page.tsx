"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import type { ProjectRecord } from "@/types/project";

function progressPercent(project: ProjectRecord) {
  if (project.stages.length === 0) return 0;
  const completed = project.stages.filter((stage) => stage.completed).length;
  return Math.round((completed / project.stages.length) * 100);
}

export default function AdminDashboardPage() {
  const [projects, setProjects] = useState<ProjectRecord[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/projects")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load projects");
        const data = await response.json();
        setProjects(data.projects);
      })
      .catch(() => setError("Could not load projects. Check AWS/DynamoDB setup."));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-stone-900">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          + New Project
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && projects === null && (
        <p className="mt-6 text-sm text-stone-500">Loading...</p>
      )}

      {!error && projects?.length === 0 && (
        <p className="mt-6 text-sm text-stone-500">
          No projects yet. Create one to start tracking progress.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {projects?.map((project) => (
          <Link
            key={project.id}
            href={`/admin/projects/${project.id}`}
            className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-orange-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">{project.clientName}</p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {project.siteLocation} · {project.areaSqFt.toLocaleString("en-IN")} sq ft
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${progressPercent(project)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-stone-400">
              {progressPercent(project)}% complete
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
