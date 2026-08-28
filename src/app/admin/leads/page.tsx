"use client";

import { useEffect, useState } from "react";
import { formatIndianCurrency } from "@/lib/utils";
import {
  QUOTE_STATUS_LABELS,
  type QuoteRecord,
  type QuoteStatus,
} from "@/types/quote";

const STATUS_STYLES: Record<QuoteStatus, string> = {
  new: "bg-orange-100 text-orange-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-stone-100 text-stone-600",
};

export default function AdminLeadsPage() {
  const [quotes, setQuotes] = useState<QuoteRecord[] | null>(null);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/quotes")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load");
        const data = await response.json();
        setQuotes(data.quotes);
      })
      .catch(() => setError("Could not load enquiries. Check the Supabase setup."));
  }, []);

  const setStatus = async (id: string, status: QuoteStatus) => {
    setSavingId(id);
    // Optimistic: revert on failure so the UI never lies about what was saved.
    const previous = quotes;
    setQuotes((qs) =>
      qs ? qs.map((q) => (q.id === id ? { ...q, status } : q)) : qs
    );

    try {
      const response = await fetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("save failed");
    } catch {
      setQuotes(previous);
      setError("Could not update that enquiry. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const newCount = quotes?.filter((q) => q.status === "new").length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-stone-900">Enquiries</h1>
        {newCount > 0 && (
          <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
            {newCount} new
          </span>
        )}
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      {!error && quotes === null && (
        <p className="mt-6 text-sm text-stone-500">Loading...</p>
      )}

      {!error && quotes?.length === 0 && (
        <p className="mt-6 text-sm text-stone-500">
          No enquiries yet. Submissions from the Get Quote form will appear here.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {quotes?.map((q) => {
          // Strip to digits here, then encodeURIComponent at the sink below.
          // The encode must stay inline in the href expression: taint analysis
          // recognizes it there, but cannot see it through a helper function.
          // `quotes.phone` has no DB check constraint on purpose — rejecting an
          // odd phone would lose the lead, which is worse than storing it — so
          // the guarantee has to live here, at render time.
          const digits = q.phone.replace(/\D/g, "");
          const waText = `Hi ${q.name}, thanks for your enquiry. Regarding your ${q.bhk || "project"}${q.sqFt ? ` (${q.sqFt} sq ft)` : ""} — when would be a good time to talk?`;

          return (
          <div
            key={q.id}
            className="rounded-xl border border-stone-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-stone-900">{q.name}</p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {q.phone}
                  {q.city ? ` · ${q.city}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {[q.bhk, q.sqFt ? `${q.sqFt.toLocaleString("en-IN")} sq ft` : null, q.workType, q.timeline]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {q.email && (
                  <p className="mt-0.5 text-xs text-stone-400">{q.email}</p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[q.status]}`}
              >
                {QUOTE_STATUS_LABELS[q.status]}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-orange-600">
              Est. {formatIndianCurrency(q.estimate)}
            </p>
            <p className="mt-0.5 text-xs text-stone-400">
              {new Date(q.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={`tel:${encodeURIComponent(digits)}`}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Call
              </a>
              <a
                href={`https://wa.me/${encodeURIComponent(digits)}?text=${encodeURIComponent(waText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-600"
              >
                WhatsApp
              </a>
              <select
                value={q.status}
                disabled={savingId === q.id}
                onChange={(event) =>
                  setStatus(q.id, event.target.value as QuoteStatus)
                }
                aria-label={`Status for ${q.name}`}
                className="ml-auto rounded-lg border border-stone-300 px-2 py-1.5 text-sm text-stone-700 disabled:opacity-50"
              >
                {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
