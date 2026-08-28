export type ConstructionStage = {
  key: string;
  label: string;
  completed: boolean;
  completedOn?: string;
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
  notes?: string;
};

/**
 * Subset of a ProjectRecord shown to a logged-in client.
 *
 * Deliberately omits `notes` (admin-only scratchpad), `phone`, `id`,
 * `signupCode`, and the check counters. Being authenticated does not entitle a
 * client to admin-side fields.
 */
export type ClientProjectStatus = {
  clientName: string;
  siteLocation: string;
  areaSqFt: number;
  floors: string;
  startedOn: string;
  status: ProjectStatus;
  stages: ConstructionStage[];
  progressPercent: number;
};
