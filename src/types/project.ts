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

/** Subset of a ProjectRecord safe to expose on the public tracker page. */
export type PublicProjectStatus = {
  clientName: string;
  siteLocation: string;
  areaSqFt: number;
  floors: string;
  startedOn: string;
  status: ProjectStatus;
  stages: ConstructionStage[];
  progressPercent: number;
};
