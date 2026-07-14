"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CreateProjectInput } from "@/types/project";

const initialForm: CreateProjectInput = {
  clientName: "",
  phone: "",
  siteLocation: "",
  areaSqFt: 0,
  floors: "",
  startedOn: new Date().toISOString().slice(0, 10),
};

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateProjectInput>(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create project");
      }

      const data = await response.json();
      router.push(`/admin/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold text-stone-900">New Project</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="clientName" className="text-sm font-semibold text-stone-800">
            Client name
          </label>
          <input
            id="clientName"
            type="text"
            required
            value={form.clientName}
            onChange={(event) => setForm((prev) => ({ ...prev, clientName: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-semibold text-stone-800">
            Mobile number
          </label>
          <input
            id="phone"
            type="tel"
            required
            placeholder="10-digit mobile"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <p className="mt-1 text-xs text-stone-400">
            The client will use this number on the public tracker page.
          </p>
        </div>

        <div>
          <label htmlFor="siteLocation" className="text-sm font-semibold text-stone-800">
            Site location
          </label>
          <input
            id="siteLocation"
            type="text"
            required
            value={form.siteLocation}
            onChange={(event) => setForm((prev) => ({ ...prev, siteLocation: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="areaSqFt" className="text-sm font-semibold text-stone-800">
              Area (sq ft)
            </label>
            <input
              id="areaSqFt"
              type="number"
              min={100}
              required
              value={form.areaSqFt || ""}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, areaSqFt: Number(event.target.value) }))
              }
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label htmlFor="floors" className="text-sm font-semibold text-stone-800">
              Floors
            </label>
            <input
              id="floors"
              type="text"
              placeholder="e.g. G+1"
              required
              value={form.floors}
              onChange={(event) => setForm((prev) => ({ ...prev, floors: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>

        <div>
          <label htmlFor="startedOn" className="text-sm font-semibold text-stone-800">
            Start date
          </label>
          <input
            id="startedOn"
            type="date"
            required
            value={form.startedOn}
            onChange={(event) => setForm((prev) => ({ ...prev, startedOn: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-orange-500 py-3 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
