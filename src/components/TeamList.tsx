"use client";

import { clientConfig } from "@/config/client";
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
 *
 * Admins type the 10 local digits, but wa.me rejects a number without a
 * dialling code ("phone number shared via url is invalid"), so the country code
 * is prefixed here. tel: gets it too — it is optional when dialling from within
 * the country but required when the client is roaming.
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
        const local = member.phone.replace(/\D/g, "");
        // Only prefix a bare local number; leave anything already
        // country-coded alone so a longer entry isn't mangled into 9191...
        const digits =
          local.length === 10 ? `${clientConfig.phoneCountryCode}${local}` : local;
        return (
          <li
            key={member.key}
            className="rounded-xl border border-stone-200 bg-white px-4 py-3 sm:flex sm:items-center sm:gap-3"
          >
            <div className="min-w-0 sm:flex-1">
              <p className="truncate text-sm font-semibold text-stone-900">
                {member.name}
              </p>
              {/* Not truncated: the number is the point of this whole feature,
                  so it wraps to a second line rather than becoming "98...". */}
              <p className="text-xs text-stone-500">
                {member.role ? `${member.role} · ` : ""}
                {member.phone}
              </p>
            </div>

            {/* Full-width tap targets on a phone; inline from sm up. */}
            <div className="mt-3 flex gap-2 sm:mt-0 sm:shrink-0">
              <a
                href={`tel:+${encodeURIComponent(digits)}`}
                aria-label={`Call ${member.name}`}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-center text-sm font-medium text-stone-700 hover:bg-stone-50 sm:flex-none sm:py-1.5"
              >
                Call
              </a>
              <a
                href={`https://wa.me/${encodeURIComponent(digits)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${member.name}`}
                className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-green-600 sm:flex-none sm:py-1.5"
              >
                WhatsApp
              </a>

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(member.key)}
                  aria-label={`Remove ${member.name} from the team`}
                  className="shrink-0 px-2 text-lg leading-none text-stone-400 hover:text-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
