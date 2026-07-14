export type StageTemplateEntry = {
  key: string;
  label: string;
};

/** Default construction stage checklist applied to every new project. */
export const STAGE_TEMPLATE: StageTemplateEntry[] = [
  { key: "mobilization", label: "Site Mobilization" },
  { key: "foundation", label: "Foundation" },
  { key: "structure", label: "Brickwork & Structure" },
  { key: "plumbing_electrical", label: "Plumbing & Electrical" },
  { key: "plastering", label: "Plastering" },
  { key: "flooring", label: "Flooring" },
  { key: "painting", label: "Painting" },
  { key: "interiors", label: "Wardrobe & Interiors" },
  { key: "handover", label: "Handover" },
];

export const PROJECT_STATUS_LABELS = {
  on_schedule: "On Schedule",
  delayed: "Delayed",
  completed: "Completed",
} as const;
