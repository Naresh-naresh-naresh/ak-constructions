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
 * forces every tier to carry identical rows in identical order and breaks as
 * soon as one tier gains a category, and it cannot be made to fit a phone,
 * which is most of this traffic.
 *
 * Categories use native `<details>`: keyboard accessible and findable by the
 * browser's own find-in-page for free, and they still open if hydration is slow
 * on a cheap phone.
 *
 * Palette is deliberately warmer and heavier than the rest of the page — gold
 * headers on cream, rather than the site's stone greys. A spec sheet this dense
 * reads as washed out in light neutrals, and the gold carries the "premium"
 * signal the tiers are selling.
 */
export default function Packages({ packages, onGetQuote }: PackagesProps) {
  if (packages.length === 0) return null;

  return (
    <section
      id="packages"
      className="bg-gradient-to-b from-stone-100 to-amber-50/50 px-4 py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Transparent pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-900 md:text-4xl">
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
              className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl transition ${
                pkg.highlight
                  ? "border-2 border-orange-500 shadow-orange-900/10 lg:-mt-3 lg:mb-3"
                  : "border border-amber-200 shadow-stone-900/5"
              }`}
            >
              {/* Header */}
              <div
                className={`px-6 py-6 text-center ${
                  pkg.highlight
                    ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white"
                    : "bg-gradient-to-b from-amber-300 to-amber-400 text-stone-900"
                }`}
              >
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest">
                    {pkg.name}
                  </h3>
                  {pkg.highlight && (
                    <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      Most popular
                    </span>
                  )}
                </div>

                {/* Short rule under the name, as in the reference sheet. */}
                <span
                  aria-hidden="true"
                  className={`mx-auto mt-2 block h-0.5 w-14 ${
                    pkg.highlight ? "bg-white/50" : "bg-stone-900/25"
                  }`}
                />

                <p className="mt-3 text-4xl font-bold tracking-tight">
                  {formatIndianCurrency(pkg.ratePerSqFt)}
                  <span
                    className={`ml-1.5 text-sm font-medium ${
                      pkg.highlight ? "text-orange-100" : "text-stone-700"
                    }`}
                  >
                    per sq ft
                  </span>
                </p>

                {pkg.summary && (
                  <p
                    className={`mt-2 text-sm ${
                      pkg.highlight ? "text-orange-50" : "text-stone-700"
                    }`}
                  >
                    {pkg.summary}
                  </p>
                )}
              </div>

              {/* Categories */}
              <div className="flex-1 divide-y divide-amber-100">
                {pkg.categories.length === 0 && (
                  <p className="px-6 py-5 text-sm text-stone-400">
                    Detailed specification available on request.
                  </p>
                )}

                {pkg.categories.map((category) => (
                  <details key={category.key} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 text-sm font-bold text-stone-900 transition hover:bg-amber-50">
                      {category.title}
                      {/* Not aria-hidden: it is the only visual affordance that
                          the row expands. */}
                      <span className="shrink-0 text-xl font-normal leading-none text-amber-700 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>

                    <ul className="space-y-3 border-t border-amber-100 bg-amber-50 px-6 py-4">
                      {category.items.length === 0 && (
                        <li className="text-sm text-stone-400">
                          Details on request.
                        </li>
                      )}
                      {category.items.map((item) => (
                        <li key={item.key} className="flex gap-2.5">
                          <span
                            aria-hidden="true"
                            className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-amber-600"
                          />
                          <span className="text-sm leading-relaxed">
                            <span className="font-bold text-stone-900">
                              {item.label}
                            </span>
                            {item.value && (
                              <>
                                <span className="font-bold text-stone-900"> : </span>
                                <span className="text-stone-700">{item.value}</span>
                              </>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>

              <div className="border-t border-amber-100 bg-white px-6 py-5">
                <button
                  type="button"
                  onClick={onGetQuote}
                  className={`w-full rounded-full px-6 py-3.5 text-sm font-bold transition ${
                    pkg.highlight
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600"
                      : "bg-stone-900 text-white hover:bg-stone-800"
                  }`}
                >
                  Get detailed quote
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-sm text-stone-500">
          Rates are per sq ft of built-up area and include material, labour and
          supervision. Items listed under &ldquo;What&apos;s Not
          Included&rdquo; are quoted separately.
        </p>
      </div>
    </section>
  );
}
