"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatIndianCurrency } from "@/lib/utils";
import type {
  PackageRecord,
  PackageSpecCategory,
  UpdatePackageInput,
} from "@/types/package";

/**
 * Common category headings, offered as a datalist so they can be picked or
 * overtyped. These are group *names* only — no material, brand or grade is
 * suggested anywhere in this UI, because those have to come from AK.
 */
const CATEGORY_SUGGESTIONS = [
  "Design & Project Management",
  "Structure",
  "Bathroom & Plumbing",
  "Flooring",
  "Kitchen & Dining",
  "Doors, Windows and Railing",
  "Painting",
  "Electrical",
  "What's Not Included",
];

export default function AdminPackageEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [pkg, setPkg] = useState<PackageRecord | null>(null);
  const [others, setOthers] = useState<PackageRecord[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Detail fields are buffered and saved explicitly, so we aren't firing a
  // PATCH on every keystroke of a package name.
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [summary, setSummary] = useState("");
  const [detailError, setDetailError] = useState("");

  const [newCategory, setNewCategory] = useState("");
  // Keyed by category key: the in-progress new item for that category.
  const [itemDrafts, setItemDrafts] = useState<
    Record<string, { label: string; value: string }>
  >({});
  const [itemError, setItemError] = useState("");
  const [copyFrom, setCopyFrom] = useState("");

  useEffect(() => {
    fetch(`/api/admin/packages/${params.id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        const data = await response.json();
        setPkg(data.package);
        setName(data.package.name);
        setRate(String(data.package.ratePerSqFt));
        setSummary(data.package.summary ?? "");
      })
      .catch(() => setError("Could not load this package."));

    // Used by "copy categories from" — building a second tier from the first
    // is the difference between 10 minutes and an hour of typing.
    fetch("/api/admin/packages")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        setOthers(
          (data.packages as PackageRecord[]).filter((p) => p.id !== params.id)
        );
      })
      .catch(() => {});
  }, [params.id]);

  const save = async (patch: UpdatePackageInput) => {
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/packages/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "save failed");
      }
      const data = await response.json();
      setPkg(data.package);
      setSavedAt(Date.now());
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "save failed"
          ? err.message
          : "Could not save changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const saveCategories = (categories: PackageSpecCategory[]) => {
    if (!pkg) return;
    // Optimistic: the list re-renders immediately, then the PATCH confirms.
    setPkg({ ...pkg, categories });
    save({ categories });
  };

  const saveDetails = () => {
    const trimmed = name.trim();
    const rateValue = Number(rate);

    if (!trimmed) {
      setDetailError("The package needs a name.");
      return;
    }
    if (!Number.isFinite(rateValue) || rateValue < 0) {
      setDetailError("Rate must be a number, 0 or more.");
      return;
    }

    setDetailError("");
    save({
      name: trimmed,
      ratePerSqFt: Math.round(rateValue),
      summary: summary.trim() || undefined,
    });
  };

  const addCategory = () => {
    if (!pkg) return;
    const title = newCategory.trim();
    if (!title) return;

    saveCategories([
      ...pkg.categories,
      { key: crypto.randomUUID(), title, items: [] },
    ]);
    setNewCategory("");
  };

  const deleteCategory = (key: string) => {
    if (!pkg) return;
    const category = pkg.categories.find((c) => c.key === key);
    if (
      category &&
      category.items.length > 0 &&
      !window.confirm(
        `Delete "${category.title}" and its ${category.items.length} item(s)?`
      )
    ) {
      return;
    }
    saveCategories(pkg.categories.filter((c) => c.key !== key));
  };

  const moveCategory = (key: string, direction: -1 | 1) => {
    if (!pkg) return;
    const index = pkg.categories.findIndex((c) => c.key === key);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= pkg.categories.length) return;

    const categories = [...pkg.categories];
    [categories[index], categories[target]] = [
      categories[target],
      categories[index],
    ];
    saveCategories(categories);
  };

  const addItem = (categoryKey: string) => {
    if (!pkg) return;
    const draft = itemDrafts[categoryKey] ?? { label: "", value: "" };
    const label = draft.label.trim();

    if (!label) {
      setItemError("Give the item a name, e.g. Cement or Staircase.");
      return;
    }

    setItemError("");
    saveCategories(
      pkg.categories.map((category) =>
        category.key === categoryKey
          ? {
              ...category,
              items: [
                ...category.items,
                {
                  key: crypto.randomUUID(),
                  label,
                  value: draft.value.trim() || undefined,
                },
              ],
            }
          : category
      )
    );
    setItemDrafts({ ...itemDrafts, [categoryKey]: { label: "", value: "" } });
  };

  const deleteItem = (categoryKey: string, itemKey: string) => {
    if (!pkg) return;
    saveCategories(
      pkg.categories.map((category) =>
        category.key === categoryKey
          ? {
              ...category,
              items: category.items.filter((item) => item.key !== itemKey),
            }
          : category
      )
    );
  };

  const copyCategories = () => {
    if (!pkg || !copyFrom) return;
    const source = others.find((p) => p.id === copyFrom);
    if (!source) return;

    if (
      !window.confirm(
        `Copy ${source.categories.length} categories from "${source.name}"? ` +
          `They are added to this package — existing ones are kept. Remember to ` +
          `change the materials afterwards, since they were copied.`
      )
    ) {
      return;
    }

    // Fresh keys: reusing the source's keys would make deleting an item in one
    // package look like it should affect the other.
    const copied = source.categories.map((category) => ({
      key: crypto.randomUUID(),
      title: category.title,
      items: category.items.map((item) => ({ ...item, key: crypto.randomUUID() })),
    }));

    saveCategories([...pkg.categories, ...copied]);
    setCopyFrom("");
  };

  const deletePackage = async () => {
    if (!pkg) return;
    if (
      !window.confirm(
        `Delete "${pkg.name}" completely? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("delete failed");
      router.push("/admin/packages");
    } catch {
      setError("Could not delete the package.");
    }
  };

  if (error && !pkg) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
        <Link
          href="/admin/packages"
          className="mt-4 inline-block text-sm font-semibold text-orange-600"
        >
          ← Back to packages
        </Link>
      </div>
    );
  }

  if (!pkg) {
    return <p className="px-4 py-8 text-sm text-stone-500">Loading…</p>;
  }

  const itemCount = pkg.categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/admin/packages"
        className="text-sm font-medium text-stone-500 hover:text-orange-600"
      >
        ← All packages
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-stone-900">{pkg.name}</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            pkg.published
              ? "bg-green-100 text-green-700"
              : "bg-stone-100 text-stone-500"
          }`}
        >
          {pkg.published ? "Published" : "Draft"}
        </span>
        {isSaving && <span className="text-xs text-stone-400">Saving…</span>}
        {!isSaving && savedAt && (
          <span className="text-xs text-green-600">Saved</span>
        )}
      </div>
      <p className="mt-1 text-sm text-stone-500">
        {formatIndianCurrency(pkg.ratePerSqFt)}/sq ft · {pkg.categories.length}{" "}
        categories · {itemCount} items
      </p>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      {/* Visibility */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-stone-900">Visibility</h2>
        <label className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            checked={pkg.published}
            onChange={(e) => save({ published: e.target.checked })}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm">
            <span className="font-medium text-stone-900">Published</span>
            <span className="block text-stone-500">
              Show this package on the homepage. Leave off while you are still
              filling in the materials.
            </span>
          </span>
        </label>
        <label className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            checked={pkg.highlight}
            onChange={(e) => save({ highlight: e.target.checked })}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm">
            <span className="font-medium text-stone-900">
              Mark as &ldquo;Most popular&rdquo;
            </span>
            <span className="block text-stone-500">
              Highlights this card. Use it on one package only.
            </span>
          </span>
        </label>

        <div className="mt-5 flex items-center gap-3">
          <label className="text-sm text-stone-600" htmlFor="order">
            Position
          </label>
          <input
            id="order"
            type="number"
            value={pkg.displayOrder}
            onChange={(e) => save({ displayOrder: Number(e.target.value) || 0 })}
            className="w-20 rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
          />
          <span className="text-xs text-stone-400">
            Lower numbers show first — usually cheapest to most expensive.
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-stone-900">Details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <div>
            <label className="text-xs font-medium text-stone-500">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500">
              Rate per sq ft
            </label>
            <input
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-medium text-stone-500">
            Summary (optional)
          </label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Better finishes and branded fittings throughout"
            className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm"
          />
        </div>
        {detailError && <p className="mt-3 text-sm text-red-600">{detailError}</p>}
        <button
          type="button"
          onClick={saveDetails}
          disabled={isSaving}
          className="mt-4 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
        >
          Save details
        </button>
      </div>

      {/* Categories */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-stone-900">
          What&apos;s included
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Each category becomes a drop-down on the website. Inside it, add one
          line per item — the name on the left, the specification on the right.
        </p>

        {itemError && <p className="mt-3 text-sm text-red-600">{itemError}</p>}

        <div className="mt-4 space-y-4">
          {pkg.categories.map((category, index) => {
            const draft = itemDrafts[category.key] ?? { label: "", value: "" };
            return (
              <div
                key={category.key}
                className="rounded-2xl border border-stone-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-stone-900">
                    {category.title}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveCategory(category.key, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${category.title} up`}
                      className="rounded-lg border border-stone-300 px-2 py-1 text-xs text-stone-600 hover:bg-stone-50 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCategory(category.key, 1)}
                      disabled={index === pkg.categories.length - 1}
                      aria-label={`Move ${category.title} down`}
                      className="rounded-lg border border-stone-300 px-2 py-1 text-xs text-stone-600 hover:bg-stone-50 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category.key)}
                      aria-label={`Delete ${category.title}`}
                      className="ml-1 px-2 text-lg leading-none text-stone-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {category.items.length === 0 ? (
                  <p className="mt-3 text-sm text-stone-400">
                    No items yet.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-stone-100">
                    {category.items.map((item) => (
                      <li
                        key={item.key}
                        className="flex items-start gap-3 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-stone-900">
                            {item.label}
                          </p>
                          {item.value && (
                            <p className="text-sm text-stone-600">{item.value}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteItem(category.key, item.key)}
                          aria-label={`Remove ${item.label}`}
                          className="shrink-0 px-2 text-lg leading-none text-stone-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1.6fr_auto]">
                  <input
                    value={draft.label}
                    onChange={(e) =>
                      setItemDrafts({
                        ...itemDrafts,
                        [category.key]: { ...draft, label: e.target.value },
                      })
                    }
                    placeholder="Item, e.g. Cement"
                    className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  />
                  <input
                    value={draft.value}
                    onChange={(e) =>
                      setItemDrafts({
                        ...itemDrafts,
                        [category.key]: { ...draft, value: e.target.value },
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addItem(category.key);
                    }}
                    placeholder="Specification, e.g. 53 grade, ISI marked"
                    className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addItem(category.key)}
                    className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add category */}
        <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white p-5">
          <label className="text-sm font-medium text-stone-900">
            Add a category
          </label>
          <div className="mt-3 flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCategory();
              }}
              list="category-suggestions"
              placeholder="e.g. Structure"
              className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm"
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={addCategory}
              className="rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Type your own or pick from the list.
          </p>
        </div>

        {/* Copy from another package */}
        {others.length > 0 && (
          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <label className="text-sm font-medium text-stone-900">
              Copy categories from another package
            </label>
            <p className="mt-1 text-xs text-stone-500">
              Build one package fully, then copy its structure here and change
              only the materials that differ.
            </p>
            <div className="mt-3 flex gap-2">
              <select
                value={copyFrom}
                onChange={(e) => setCopyFrom(e.target.value)}
                className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm"
              >
                <option value="">Choose a package…</option>
                {others.map((other) => (
                  <option key={other.id} value={other.id}>
                    {other.name} ({other.categories.length} categories)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={copyCategories}
                disabled={!copyFrom}
                className="rounded-xl border border-stone-300 bg-white px-6 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 border-t border-stone-200 pt-6">
        <button
          type="button"
          onClick={deletePackage}
          className="rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Delete this package
        </button>
      </div>
    </div>
  );
}
