"use client";

import { formatIndianCurrency } from "@/lib/utils";
import type { PublicPackage } from "@/types/package";

type PackagesProps = {
  packages: PublicPackage[];
  onGetQuote: () => void;
};

/**
 * Construction package comparison, rendered entirely from what AK entered in
 * /admin/packages. Nothing here is hardcoded, so a wrong material spec is a
 * one-minute admin edit rather than a deploy.
 *
 * One independent card per package rather than a shared comparison grid. A grid
 * forces every tier to carry the same rows in the same order, which breaks the
 * moment AK adds a category to one package and not another — and it cannot be
 * made to fit a phone, which is most of this traffic.
 *
 * Categories use native `<details>`: keyboard accessible and findable by the
 * browser's own find-in-page for free, and they still open if hydration is slow
 * on a cheap phone.
 */
export default function Packages({ packages, onGetQuote }: PackagesProps) {
  if (packages.length === 0) return null;

  return (
    <section id="packages" className="bg-stone-50 px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-stone-900 md:text-4xl">
            Our construction packages
          </h2>
          <p className="mt-4 text-lg text-stone-600">
            Every material listed up front, so you know exactly what you are
            paying for before work starts.
          </p>
        </div>

        <div
          className={`mt-10 grid gap-6 ${
            packages.length === 1
              ? "max-w-md"
              : packages.length === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-white ${
                pkg.highlight
                  ? "border-orange-500 ring-2 ring-orange-500/30"
                  : "border-stone-200"
              }`}
            >
              {/* Header */}
              <div
                className={`px-6 py-5 text-center ${
                  pkg.highlight ? "bg-orange-500 text-white" : "bg-stone-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <h3
                    className={`text-base font-bold uppercase tracking-wide ${
                      pkg.highlight ? "text-white" : "text-stone-700"
                    }`}
                  >
                    {pkg.name}
                  </h3>
                  {pkg.highlight && (
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold">
                      Most popular
                    </span>
                  )}
                </div>
                <p
                  className={`mt-2 text-3xl font-bold ${
                    pkg.highlight ? "text-white" : "text-stone-900"
                  }`}
                >
                  {formatIndianCurrency(pkg.ratePerSqFt)}
                  <span
                    className={`ml-1 text-sm font-medium ${
                      pkg.highlight ? "text-orange-100" : "text-stone-500"
                    }`}
                  >
                    per sq ft
                  </span>
                </p>
                {pkg.summary && (
                  <p
                    className={`mt-2 text-sm ${
                      pkg.highlight ? "text-orange-50" : "text-stone-600"
                    }`}
                  >
                    {pkg.summary}
                  </p>
                )}
              </div>

              {/* Categories */}
              <div className="flex-1 divide-y divide-stone-100">
                {pkg.categories.length === 0 && (
                  <p className="px-6 py-5 text-sm text-stone-400">
                    Detailed specification available on request.
                  </p>
                )}

                {pkg.categories.map((category) => (
                  <details key={category.key} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-3.5 text-sm font-semibold text-stone-900 hover:bg-stone-50">
                      {category.title}
                      {/* Not aria-hidden: it is the only visual affordance that
                          the row expands. */}
                      <span className="shrink-0 text-lg leading-none text-stone-400 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>

                    <ul className="space-y-2.5 bg-amber-50/60 px-6 py-4">
                      {category.items.length === 0 && (
                        <li className="text-sm text-stone-400">
                          Details on request.
                        </li>
                      )}
                      {category.items.map((item) => (
                        <li key={item.key} className="text-sm leading-relaxed">
                          <span className="font-semibold text-stone-900">
                            {item.label}
                          </span>
                          {item.value && (
                            <>
                              <span className="text-stone-400"> : </span>
                              <span className="text-stone-700">{item.value}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>

              <div className="border-t border-stone-100 px-6 py-5">
                <button
                  type="button"
                  onClick={onGetQuote}
                  className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition ${
                    pkg.highlight
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "border border-stone-300 text-stone-800 hover:bg-stone-50"
                  }`}
                >
                  Get detailed quote
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-3xl text-sm text-stone-500">
          Rates are per sq ft of built-up area and include material, labour and
          supervision. Government approvals, compound wall and landscaping are
          quoted separately.
        </p>
      </div>
    </section>
  );
}
