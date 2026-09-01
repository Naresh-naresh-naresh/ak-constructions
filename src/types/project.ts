export type ConstructionStage = {
  key: string;
  label: string;
  completed: boolean;
  completedOn?: string;
};

/**
 * Someone from AK Constructions assigned to this project — site engineer,
 * supervisor, designer. Shown to the client so they know who to call.
 */
export type ProjectTeamMember = {
  key: string;
  name: string;
  /** e.g. "Site Engineer". Optional — a name and number is the minimum useful. */
  role?: string;
  phone: string;
};

export type ProjectStatus = "on_schedule" | "delayed" | "completed";

export type ProjectRecord = {
  id: string;
  clientName: string;
  phone: string;
  siteLocation: string;
  areaSqFt: number;
  floors: string;
  startedOn: string;
  status: ProjectStatus;
  stages: ConstructionStage[];
  team?: ProjectTeamMember[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
  checkCount?: number;
  /** One-time code the admin shares so this client can register an account. */
  signupCode?: string;
};

export type CreateProjectInput = {
  clientName: string;
  phone: string;
  siteLocation: string;
  areaSqFt: number;
  floors: string;
  startedOn: string;
};

export type UpdateProjectInput = {
  status?: ProjectStatus;
  stages?: ConstructionStage[];
  team?: ProjectTeamMember[];
  notes?: string;
};

/**
 * Subset of a ProjectRecord shown to a logged-in client.
 *
 * Deliberately omits `notes` (admin-only scratchpad), `phone`, `id`,
 * `signupCode`, and the check counters. Being authenticated does not entitle a
 * client to admin-side fields.
 *
 * `team` IS included — the whole point is that the client can see and call the
 * engineer assigned to their build.
 */
export type ClientProjectStatus = {
  clientName: string;
  siteLocation: string;
  areaSqFt: number;
  floors: string;
  startedOn: string;
  status: ProjectStatus;
  stages: ConstructionStage[];
  team: ProjectTeamMember[];
  progressPercent: number;
};
