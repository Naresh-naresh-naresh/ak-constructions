"use client";

import { useState } from "react";
import {
  packageSpecs,
  packageTiers,
  packagesConfig,
} from "@/config/packages";
import { formatIndianCurrency } from "@/lib/utils";

type PackagesProps = {
  onGetQuote: () => void;
};

/**
 * Tier comparison for construction packages.
 *
 * Mobile is the primary target, and a 3-column comparison table does not fit a
 * phone. So on mobile the tier cards double as a selector and each spec row
 * shows one value; on desktop all three columns are visible at once. Same data,
 * two layouts, no duplicated content.
 *
 * The spec categories are `<details>` rather than state-driven accordions: they
 * are keyboard accessible and findable by the browser's in-page search for free,
 * and they still work if hydration is slow on a cheap phone.
 *
 * Rows whose values are all blank are dropped, so an unfinished category in the
 * config renders as a shorter list instead of a wall of empty rows.
 */
export default function Packages({ onGetQuote }: PackagesProps) {
  const [selected, setSelected] = useState(() => {
    const i = packageTiers.findIndex((tier) => tier.highlight);
    return i === -1 ? 0 : i;
  });

  const categories = packageSpecs
    .map((category) => ({
      ...category,
      rows: category.rows.filter((row) => row.values.some((v) => v.trim())),
    }))
    .filter((category) => category.rows.length > 0);

  return (
    <section id="packages" className="bg-stone-50 px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-stone-900 md:text-4xl">
            {packagesConfig.heading}
          </h2>
          <p className="mt-4 text-lg text-stone-600">
            {packagesConfig.subheading}
          </p>
        </div>

        {/* Tier cards. On mobile these are also the selector for the spec rows. */}
        <div
          role="tablist"
          aria-label="Construction packages"
          className="mt-10 grid gap-5 md:grid-cols-3"
        >
          {packageTiers.map((tier, index) => {
            const isSelected = index === selected;
            return (
              <button
                key={tier.key}
                type="button"
                role="tab"
                id={`package-tab-${tier.key}`}
                aria-selected={isSelected}
                aria-controls="package-specs"
                onClick={() => setSelected(index)}
                className={`rounded-2xl border bg-white p-6 text-left transition md:cursor-default ${
                  isSelected
                    ? "border-orange-500 ring-2 ring-orange-500/30 md:ring-0"
                    : "border-stone-200 hover:border-stone-300"
                } ${tier.highlight ? "md:border-orange-500 md:ring-2 md:ring-orange-500/30" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-stone-900">
                    {tier.name}
                  </h3>
                  {tier.highlight && (
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                      Most popular
                    </span>
                  )}
                </div>

                <p className="mt-4 text-3xl font-bold text-stone-900">
                  {formatIndianCurrency(tier.ratePerSqFt)}
                  <span className="ml-1 text-base font-medium text-stone-500">
                    / sq ft
                  </span>
                </p>

                <p className="mt-3 text-sm text-stone-600">{tier.summary}</p>

                {/* On mobile the card is the tab, so the CTA lives outside it. */}
                <span className="mt-5 hidden text-sm font-semibold text-orange-600 md:inline-block">
                  Included below ↓
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-sm text-stone-500">{packagesConfig.footnote}</p>

        {/* Spec comparison */}
        {categories.length > 0 && (
          <div id="package-specs" className="mt-12">
            <h3 className="text-xl font-bold text-stone-900">
              What&apos;s included
            </h3>
            <p className="mt-1 text-sm text-stone-500 md:hidden">
              Showing{" "}
              <strong className="text-stone-700">
                {packageTiers[selected]?.name}
              </strong>
              . Tap a package above to compare.
            </p>

            {/* Desktop column headers, sticky so they survive a long scroll. */}
            <div className="sticky top-16 z-10 mt-5 hidden grid-cols-[1.5fr_repeat(3,1fr)] gap-4 border-b border-stone-300 bg-stone-50 py-3 md:grid">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                Item
              </span>
              {packageTiers.map((tier) => (
                <span
                  key={tier.key}
                  className="text-xs font-semibold uppercase tracking-wide text-stone-600"
                >
                  {tier.name}
                </span>
              ))}
            </div>

            <div className="mt-2 space-y-3">
              {categories.map((category, categoryIndex) => (
                <details
                  key={category.key}
                  open={categoryIndex === 0}
                  className="group overflow-hidden rounded-2xl border border-stone-200 bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-stone-900 hover:bg-stone-50">
                    {category.title}
                    <span className="text-stone-400 transition group-open:rotate-180">
                      ▾
                    </span>
                  </summary>

                  <div className="border-t border-stone-100 px-5 pb-4 pt-1">
                    {category.rows.map((row) => (
                      <div
                        key={row.label}
                        className="border-b border-stone-100 py-3 last:border-b-0 md:grid md:grid-cols-[1.5fr_repeat(3,1fr)] md:gap-4"
                      >
                        <p className="text-sm text-stone-500">{row.label}</p>

                        {/* Mobile: the selected tier only. */}
                        <p className="mt-0.5 text-sm font-medium text-stone-900 md:hidden">
                          {row.values[selected]?.trim() || "—"}
                        </p>

                        {/* Desktop: all three, side by side. */}
                        {row.values.map((value, i) => (
                          <p
                            key={packageTiers[i]?.key ?? i}
                            className="hidden text-sm font-medium text-stone-900 md:block"
                          >
                            {value.trim() || "—"}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <button
            type="button"
            onClick={onGetQuote}
            className="w-full rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-orange-600 sm:w-auto"
          >
            Get a detailed quote
          </button>
        </div>
      </div>
    </section>
  );
}
