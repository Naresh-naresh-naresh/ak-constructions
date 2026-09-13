"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatIndianCurrency } from "@/lib/utils";
import type { PackageRecord } from "@/types/package";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageRecord[] | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [summary, setSummary] = useState("");
  const [formError, setFormError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const load = async () => {
    try {
      const response = await fetch("/api/admin/packages");
      if (!response.ok) throw new Error("load failed");
      const data = await response.json();
      setPackages(data.packages);
    } catch {
      setError("Could not load packages.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const trimmed = name.trim();
    const rateValue = Number(rate);

    if (!trimmed) {
      setFormError("Give the package a name, e.g. Standard Package.");
      return;
    }
    if (!Number.isFinite(rateValue) || rateValue <= 0) {
      setFormError("Enter the rate per sq ft, e.g. 1899.");
      return;
    }

    setFormError("");
    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          ratePerSqFt: rateValue,
          summary: summary.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "create failed");
      }
      setName("");
      setRate("");
      setSummary("");
      await load();
    } catch (err) {
      setFormError(
        err instanceof Error && err.message !== "create failed"
          ? err.message
          : "Could not create the package."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const publishedCount = packages?.filter((p) => p.published).length ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900">Construction Packages</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        These show on the homepage as a side-by-side comparison. Add a package,
        then open it to fill in the categories and materials. Nothing appears on
        the website until you tick <strong>Published</strong>.
      </p>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      {/* Create */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-stone-900">Add a package</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Package name, e.g. Standard Package"
            className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm"
          />
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            inputMode="numeric"
            placeholder="Rate per sq ft, e.g. 1899"
            className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm"
          />
        </div>
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="One-line summary (optional), e.g. Solid build with dependable materials"
          className="mt-3 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm"
        />

        {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

        <button
          type="button"
          onClick={create}
          disabled={isCreating}
          className="mt-4 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {isCreating ? "Adding…" : "Add package"}
        </button>
      </div>

      {/* List */}
      {packages && packages.length === 0 && (
        <p className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
          No packages yet. Add one above — most builders use three: Standard,
          Premium and Ultra Luxury.
        </p>
      )}

      {packages && packages.length > 0 && (
        <>
          <p className="mt-8 text-sm text-stone-500">
            {publishedCount} of {packages.length} live on the website.
          </p>
          <ul className="mt-3 space-y-3">
            {packages.map((pkg) => {
              const itemCount = pkg.categories.reduce(
                (sum, category) => sum + category.items.length,
                0
              );
              return (
                <li key={pkg.id}>
                  <Link
                    href={`/admin/packages/${pkg.id}`}
                    className="block rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-orange-300"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-stone-900">{pkg.name}</span>
                      {pkg.highlight && (
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                          Most popular
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          pkg.published
                            ? "bg-green-100 text-green-700"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {pkg.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-600">
                      {formatIndianCurrency(pkg.ratePerSqFt)}/sq ft ·{" "}
                      {pkg.categories.length} categories · {itemCount} items
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
