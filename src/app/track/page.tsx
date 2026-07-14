"use client";

import { useState } from "react";
import StageChecklist from "@/components/StageChecklist";
import StatusBadge from "@/components/StatusBadge";
import { clientConfig } from "@/config/client";
import type { PublicProjectStatus } from "@/types/project";

export default function TrackProjectPage() {
  const [phone, setPhone] = useState("");
  const [projects, setProjects] = useState<PublicProjectStatus[] | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setProjects(null);

    try {
      const response = await fetch(`/api/track?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not find a project for this number");
      }

      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-stone-900">Track Your Project</h1>
        <p className="mt-2 text-sm text-stone-500">
          Enter the mobile number you shared with {clientConfig.name} to see your
          construction progress.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <input
            type="tel"
            required
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="shrink-0 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "..." : "Track"}
          </button>
        </form>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
        )}

        {projects?.map((project, index) => (
          <div
            key={index}
            className="mt-6 rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">{project.clientName}</p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {project.siteLocation} · {project.areaSqFt.toLocaleString("en-IN")} sq ft · {project.floors}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">Started {project.startedOn}</p>
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
