"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StageChecklist from "@/components/StageChecklist";
import StatusBadge from "@/components/StatusBadge";
import TeamList from "@/components/TeamList";
import { clientConfig } from "@/config/client";
import { PROJECT_STATUS_LABELS } from "@/config/stages";
import type { ProjectRecord, ProjectStatus } from "@/types/project";

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [newStageLabel, setNewStageLabel] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [teamError, setTeamError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  // Used to build an absolute signup link for the WhatsApp message.
  const siteOrigin = typeof window === "undefined" ? "" : window.location.origin;

  const resetClientLogin = async () => {
    if (!project) return;
    if (
      !window.confirm(
        "Reset this client's login? Their current password stops working and a new invite code is issued."
      )
    ) {
      return;
    }

    setIsResetting(true);
    setResetMessage("");

    try {
      const response = await fetch(
        `/api/admin/client-accounts/${encodeURIComponent(project.phone)}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Reset failed");

      // Reload so the newly issued signup code is shown.
      const refreshed = await fetch(`/api/admin/projects/${project.id}`);
      if (refreshed.ok) {
        const data = await refreshed.json();
        setProject(data.project);
      }
      setResetMessage("Done — send the client the new invite code.");
    } catch {
      setResetMessage("Could not reset the login. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

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
      setError("Could not save changes. Check the Supabase setup.");
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

  const addStage = () => {
    if (!project || !newStageLabel.trim()) return;
    const stages = [
      ...project.stages,
      { key: crypto.randomUUID(), label: newStageLabel.trim(), completed: false },
    ];
    setProject({ ...project, stages });
    setNewStageLabel("");
    save({ stages, status: project.status, notes: project.notes });
  };

  const deleteStage = (key: string) => {
    if (!project) return;
    const stages = project.stages.filter((stage) => stage.key !== key);
    setProject({ ...project, stages });
    save({ stages, status: project.status, notes: project.notes });
  };

  const addTeamMember = () => {
    if (!project) return;
    const name = newMemberName.trim();
    const phone = newMemberPhone.replace(/\D/g, "");

    if (!name) {
      setTeamError("Enter the person's name.");
      return;
    }
    if (phone.length !== 10) {
      setTeamError("Enter a valid 10-digit mobile number.");
      return;
    }

    setTeamError("");
    const team = [
      ...(project.team ?? []),
      {
        key: crypto.randomUUID(),
        name,
        role: newMemberRole.trim() || undefined,
        phone,
      },
    ];
    setProject({ ...project, team });
    setNewMemberName("");
    setNewMemberRole("");
    setNewMemberPhone("");
    save({ stages: project.stages, status: project.status, notes: project.notes, team });
  };

  const deleteTeamMember = (key: string) => {
    if (!project) return;
    const team = (project.team ?? []).filter((m) => m.key !== key);
    setProject({ ...project, team });
    save({ stages: project.stages, status: project.status, notes: project.notes, team });
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
          <p className="mt-0.5 text-xs text-stone-400">
            {project.checkCount && project.lastCheckedAt
              ? `Checked ${project.checkCount}× · Last ${new Date(
                  project.lastCheckedAt
                ).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
              : "Not checked yet"}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-sm font-semibold text-stone-800">Client login</p>
        <p className="mt-1 text-xs text-stone-400">
          Send this invite code to the client — they need it once, to create
          their account at /signup.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-stone-100 px-3 py-2 font-mono text-lg tracking-widest text-stone-900">
            {project.signupCode || "—"}
          </code>
          {project.signupCode && (
            /* Encoding is inlined at the sink rather than delegated to
               buildWhatsAppUrl: taint analysis recognizes encodeURIComponent
               here but cannot see it through a helper. Phone is stripped to
               digits and the scheme is a literal, so this href cannot be
               redirected. */
            <a
              href={`https://wa.me/${encodeURIComponent(project.phone.replace(/\D/g, ""))}?text=${encodeURIComponent(
                `Hi ${project.clientName}, you can now track your project with ${clientConfig.name}.\n\nCreate your account here: ${siteOrigin}/signup\nMobile: ${project.phone}\nInvite code: ${project.signupCode}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600"
            >
              WhatsApp
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={resetClientLogin}
          disabled={isResetting}
          className="mt-3 text-xs font-medium text-stone-500 underline hover:text-red-600 disabled:opacity-50"
        >
          {isResetting ? "Resetting..." : "Reset client login (issues a new code)"}
        </button>
        {resetMessage && (
          <p className="mt-2 text-xs text-stone-500">{resetMessage}</p>
        )}
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
        <p className="mt-1 text-xs text-stone-400">
          Tap a stage to mark it complete/incomplete. Tap ✕ to remove one you don't need.
        </p>
        <div className="mt-3">
          <StageChecklist
            stages={project.stages}
            onToggle={toggleStage}
            onDelete={deleteStage}
          />
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="e.g. Kitchen Tiles"
            value={newStageLabel}
            onChange={(event) => setNewStageLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addStage();
              }
            }}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <button
            type="button"
            onClick={addStage}
            disabled={!newStageLabel.trim()}
            className="shrink-0 rounded-xl border border-orange-500 px-4 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Stage
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-stone-800">Site team</p>
        <p className="mt-1 text-xs text-stone-400">
          The client sees these names and can call or WhatsApp them directly from
          their dashboard.
        </p>

        <div className="mt-3">
          <TeamList
            team={project.team ?? []}
            onDelete={deleteTeamMember}
            emptyLabel="No one assigned yet. Add the site engineer below."
          />
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              placeholder="Name"
              value={newMemberName}
              onChange={(event) => setNewMemberName(event.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <input
              type="text"
              placeholder="Role (e.g. Site Engineer)"
              value={newMemberRole}
              onChange={(event) => setNewMemberRole(event.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="10-digit mobile"
              value={newMemberPhone}
              onChange={(event) => setNewMemberPhone(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTeamMember();
                }
              }}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <button
              type="button"
              onClick={addTeamMember}
              className="shrink-0 rounded-xl border border-orange-500 px-4 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              + Add Person
            </button>
          </div>
          {teamError && <p className="text-sm text-red-600">{teamError}</p>}
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
