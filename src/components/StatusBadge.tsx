import { PROJECT_STATUS_LABELS } from "@/config/stages";
import type { ProjectStatus } from "@/types/project";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  on_schedule: "bg-green-100 text-green-700",
  delayed: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
