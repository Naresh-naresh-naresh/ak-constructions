/**
 * Construction packages — the tier comparison shown on the homepage.
 *
 * ## Read this before editing
 *
 * Every `value` below is a public technical claim a customer decides to spend
 * lakhs on. Brand names, concrete grades and thicknesses must come from Balaji,
 * not from a competitor's website and not from a guess. A customer who is told
 * "Grade 500 TMT" and gets Grade 415 has a straightforward complaint.
 *
 * `enabled` is the safety catch: the section does not render until it is set to
 * `true`, so a half-filled sheet can never reach the live site. Fill in the
 * values, flip the flag, and the section appears.
 *
 * Rows are free-form on purpose. Delete rows AK doesn't want to commit to in
 * writing, and add ones the competition doesn't list. A row with an empty value
 * is skipped at render time rather than showing a blank line, so partial
 * categories degrade gracefully.
 */

export type PackageSpecRow = {
  label: string;
  /** One entry per tier, in the same order as `packageTiers`. Empty = hidden. */
  values: [string, string, string];
};

export type PackageSpecCategory = {
  key: string;
  title: string;
  rows: PackageSpecRow[];
};

export type PackageTier = {
  key: string;
  name: string;
  /** Rate in rupees per sq ft. */
  ratePerSqFt: number;
  /** One line on who this tier suits. */
  summary: string;
  /** Draws the "most popular" ring. Exactly one tier should set this. */
  highlight?: boolean;
};

export const packagesConfig = {
  /**
   * Leave false until every value below is confirmed by Balaji.
   * See docs/PACKAGES-CHECKLIST.md for the sheet to send him.
   */
  enabled: false,

  heading: "Construction packages",
  subheading:
    "Transparent, all-inclusive rates. Every material is listed up front — no surprises once work starts.",
  /** Shown under the tier cards. */
  footnote:
    "Rates are per sq ft of built-up area and include material, labour and supervision. Government approvals, compound wall and landscaping are quoted separately.",
} as const;

/**
 * Order matters: it drives the column order in every spec row below.
 * AK's current single rate is ₹1,899/sq ft — that is real. The other two rates
 * are placeholders and MUST be replaced before enabling this section.
 */
export const packageTiers: PackageTier[] = [
  {
    key: "standard",
    name: "Standard",
    ratePerSqFt: 1899,
    summary: "Solid build with dependable, everyday-use materials.",
  },
  {
    key: "premium",
    name: "Premium",
    ratePerSqFt: 0,
    summary: "Better finishes and branded fittings throughout.",
    highlight: true,
  },
  {
    key: "luxury",
    name: "Ultra Luxury",
    ratePerSqFt: 0,
    summary: "Top-of-the-line materials and bespoke detailing.",
  },
];

export const packageSpecs: PackageSpecCategory[] = [
  {
    key: "project-management",
    title: "Design & Project Management",
    rows: [
      { label: "Architectural drawings", values: ["", "", ""] },
      { label: "3D elevation", values: ["", "", ""] },
      { label: "Interior design consultation", values: ["", "", ""] },
      { label: "Structural consultant", values: ["", "", ""] },
      { label: "Site supervision", values: ["", "", ""] },
      { label: "Expected duration", values: ["", "", ""] },
    ],
  },
  {
    key: "structure",
    title: "Structure",
    rows: [
      { label: "Cement", values: ["", "", ""] },
      { label: "Steel (TMT)", values: ["", "", ""] },
      { label: "Concrete grade — footing & columns", values: ["", "", ""] },
      { label: "Concrete grade — slab", values: ["", "", ""] },
      { label: "Blocks / bricks", values: ["", "", ""] },
      { label: "External wall thickness", values: ["", "", ""] },
      { label: "Internal wall thickness", values: ["", "", ""] },
      { label: "Floor-to-ceiling height", values: ["", "", ""] },
    ],
  },
  {
    key: "bathroom-plumbing",
    title: "Bathroom & Plumbing",
    rows: [
      { label: "CP fittings", values: ["", "", ""] },
      { label: "Sanitaryware", values: ["", "", ""] },
      { label: "Wall tiles", values: ["", "", ""] },
      { label: "Floor tiles", values: ["", "", ""] },
      { label: "Plumbing pipes", values: ["", "", ""] },
      { label: "Overhead water tank", values: ["", "", ""] },
    ],
  },
  {
    key: "flooring",
    title: "Flooring",
    rows: [
      { label: "Living & dining", values: ["", "", ""] },
      { label: "Bedrooms", values: ["", "", ""] },
      { label: "Kitchen", values: ["", "", ""] },
      { label: "Balcony & utility", values: ["", "", ""] },
      { label: "Staircase", values: ["", "", ""] },
      { label: "Skirting", values: ["", "", ""] },
    ],
  },
  {
    key: "kitchen",
    title: "Kitchen & Dining",
    rows: [
      { label: "Countertop", values: ["", "", ""] },
      { label: "Dado tiles", values: ["", "", ""] },
      { label: "Sink", values: ["", "", ""] },
      { label: "Modular units", values: ["", "", ""] },
      { label: "Appliance & RO points", values: ["", "", ""] },
    ],
  },
  {
    key: "doors-windows",
    title: "Doors, Windows & Railing",
    rows: [
      { label: "Main door", values: ["", "", ""] },
      { label: "Internal doors", values: ["", "", ""] },
      { label: "Bathroom doors", values: ["", "", ""] },
      { label: "Windows", values: ["", "", ""] },
      { label: "Window grills", values: ["", "", ""] },
      { label: "Staircase railing", values: ["", "", ""] },
      { label: "Balcony railing", values: ["", "", ""] },
    ],
  },
  {
    key: "electrical-painting",
    title: "Electrical & Painting",
    rows: [
      { label: "Wiring", values: ["", "", ""] },
      { label: "Switches & sockets", values: ["", "", ""] },
      { label: "Interior paint", values: ["", "", ""] },
      { label: "Exterior paint", values: ["", "", ""] },
      { label: "Putty & primer", values: ["", "", ""] },
      { label: "Light & fan points", values: ["", "", ""] },
    ],
  },
];
