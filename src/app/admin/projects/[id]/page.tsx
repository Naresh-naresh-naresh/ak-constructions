"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StageChecklist from "@/components/StageChecklist";
import StatusBadge from "@/components/StatusBadge";
import { PROJECT_STATUS_LABELS } from "@/config/stages";
import type { ProjectRecord, ProjectStatus } from "@/types/project";

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/admin/projects/${params.id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load project");
        const data = await response.json();
        setProject(data.project);
        setNotes(data.project.notes || "");
      })
      .catch(() => setError("Could not load this project."));
  }, [params.id]);

  const save = async (patch: Partial<ProjectRecord>) => {
    if (!project) return;
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!response.ok) throw new Error("Failed to save changes");
      const data = await response.json();
      setProject(data.project);
      setSavedAt(Date.now());
    } catch {
      setError("Could not save changes. Check AWS/DynamoDB setup.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStage = (key: string) => {
    if (!project) return;
    const stages = project.stages.map((stage) =>
      stage.key === key
        ? {
            ...stage,
            completed: !stage.completed,
            completedOn: !stage.completed
              ? new Date().toISOString().slice(0, 10)
              : undefined,
          }
        : stage
    );
    setProject({ ...project, stages });
    save({ stages, status: project.status, notes: project.notes });
  };

  const changeStatus = (status: ProjectStatus) => {
    if (!project) return;
    setProject({ ...project, status });
    save({ stages: project.stages, status, notes: project.notes });
  };

  if (error) {
    return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  if (!project) {
    return <p className="text-sm text-stone-500">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{project.clientName}</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {project.siteLocation} · {project.areaSqFt.toLocaleString("en-IN")} sq ft · {project.floors}
          </p>
          <p className="mt-0.5 text-xs text-stone-400">
            Tracker phone: {project.phone} · Started {project.startedOn}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-6">
        <label htmlFor="status" className="text-sm font-semibold text-stone-800">
          Status
        </label>
        <select
          id="status"
          value={project.status}
          onChange={(event) => changeStatus(event.target.value as ProjectStatus)}
          className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        >
          {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-stone-800">Construction stages</p>
        <p className="mt-1 text-xs text-stone-400">Tap a stage to mark it complete/incomplete.</p>
        <div className="mt-3">
          <StageChecklist stages={project.stages} onToggle={toggleStage} />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="notes" className="text-sm font-semibold text-stone-800">
          Notes (visible to you only)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={() => save({ stages: project.stages, status: project.status, notes })}
          className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <p className="mt-4 text-xs text-stone-400">
        {isSaving ? "Saving..." : savedAt ? "Saved" : ""}
      </p>
    </div>
  );
}
