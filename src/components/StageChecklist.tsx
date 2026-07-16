import type { ConstructionStage } from "@/types/project";

type StageChecklistProps = {
  stages: ConstructionStage[];
  onToggle?: (key: string) => void;
  onDelete?: (key: string) => void;
};

export default function StageChecklist({ stages, onToggle, onDelete }: StageChecklistProps) {
  const editable = Boolean(onToggle);

  return (
    <ol className="space-y-2">
      {stages.map((stage, index) => (
        <li
          key={stage.key}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            stage.completed
              ? "border-green-200 bg-green-50"
              : "border-stone-200 bg-white"
          }`}
        >
          <button
            type="button"
            disabled={!editable}
            onClick={() => onToggle?.(stage.key)}
            aria-label={`Mark ${stage.label} as ${stage.completed ? "incomplete" : "complete"}`}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
              stage.completed
                ? "border-green-500 bg-green-500 text-white"
                : "border-stone-300 text-stone-400"
            } ${editable ? "cursor-pointer" : "cursor-default"}`}
          >
            {stage.completed ? "✓" : index + 1}
          </button>
          <span
            className={`flex-1 text-sm font-medium ${
              stage.completed ? "text-green-800" : "text-stone-700"
            }`}
          >
            {stage.label}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(stage.key)}
              aria-label={`Remove ${stage.label} stage`}
              className="shrink-0 text-lg leading-none text-stone-400 hover:text-red-600"
            >
              ✕
            </button>
          )}
        </li>
      ))}
    </ol>
  );
}
