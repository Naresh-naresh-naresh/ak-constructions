/**
 * Construction packages — the tier comparison on the homepage.
 *
 * Every spec here is a public technical claim a customer commits lakhs against,
 * so none of it is hardcoded: AK enters it in /admin/packages, the same way
 * stages and site team are entered per project. That also means the content
 * can be fixed without a deploy.
 *
 * Categories and their items are stored as one `jsonb` column rather than
 * separate tables. It follows the existing `stages` / `team` pattern, and these
 * are only ever read and written as a whole package — there is no query that
 * wants a single spec row.
 */

/**
 * One bullet inside a category, e.g. label "Staircase", value "Granite, upto
 * ₹160/sq ft". `value` is optional so a category can hold plain inclusions
 * ("3D elevation") that have no specification to state.
 */
export type PackageSpecItem = {
  key: string;
  label: string;
  value?: string;
};

/** A collapsible group, e.g. "Structure" or "Bathroom & Plumbing". */
export type PackageSpecCategory = {
  key: string;
  title: string;
  items: PackageSpecItem[];
};

export type PackageRecord = {
  id: string;
  name: string;
  ratePerSqFt: number;
  /** One line on who the tier suits. Optional. */
  summary?: string;
  /** Draws the "Most popular" ring. More than one is allowed but pointless. */
  highlight: boolean;
  /**
   * Unpublished packages are invisible to the public but fully editable in
   * admin. This is what lets AK build a tier over several sittings without a
   * half-finished spec sheet being live.
   */
  published: boolean;
  /** Ascending. Ties fall back to createdAt so ordering is never arbitrary. */
  displayOrder: number;
  categories: PackageSpecCategory[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePackageInput = {
  name: string;
  ratePerSqFt: number;
  summary?: string;
};

export type UpdatePackageInput = {
  name?: string;
  ratePerSqFt?: number;
  summary?: string;
  highlight?: boolean;
  published?: boolean;
  displayOrder?: number;
  categories?: PackageSpecCategory[];
};

/**
 * What the public homepage receives. Drops the admin-only publishing controls
 * and timestamps — a visitor has no use for `published` or `displayOrder`, and
 * omitting them here means a future admin-only field can't leak by default.
 */
export type PublicPackage = {
  id: string;
  name: string;
  ratePerSqFt: number;
  summary?: string;
  highlight: boolean;
  categories: PackageSpecCategory[];
};
