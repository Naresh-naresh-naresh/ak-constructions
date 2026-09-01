"use client";

import type { ProjectTeamMember } from "@/types/project";

type TeamListProps = {
  team: ProjectTeamMember[];
  /** Omit to render read-only (the client dashboard). */
  onDelete?: (key: string) => void;
  emptyLabel?: string;
};

/**
 * Site team for a project. Read-only for clients, deletable for the admin.
 *
 * Phone numbers are stripped to digits and encoded inline in each href. That
 * encode must stay inline rather than move into a helper: static analysis
 * recognizes sanitization at the sink, but can't follow it through a function.
 */
export default function TeamList({ team, onDelete, emptyLabel }: TeamListProps) {
  if (team.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        {emptyLabel ?? "No one assigned yet."}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {team.map((member) => {
        const digits = member.phone.replace(/\D/g, "");
        return (
          <li
            key={member.key}
            className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-900">
                {member.name}
              </p>
              <p className="truncate text-xs text-stone-500">
                {member.role ? `${member.role} · ` : ""}
                {member.phone}
              </p>
            </div>

            <a
              href={`tel:${encodeURIComponent(digits)}`}
              aria-label={`Call ${member.name}`}
              className="shrink-0 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Call
            </a>
            <a
              href={`https://wa.me/${encodeURIComponent(digits)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${member.name}`}
              className="shrink-0 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-600"
            >
              WhatsApp
            </a>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(member.key)}
                aria-label={`Remove ${member.name} from the team`}
                className="shrink-0 text-lg leading-none text-stone-400 hover:text-red-600"
              >
                ✕
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
