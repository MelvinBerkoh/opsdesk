"use client";

import { useActionState } from "react";

import {
  type UpdateIncidentActionState,
  updateIncidentAction,
} from "@/features/incidents/server/update-incident-action";

type IncidentDetailsFormProps = {
  workspaceId: string;
  workspaceSlug: string;
  incidentId: string;
  incidentNumber: number;

  status:
    | "OPEN"
    | "INVESTIGATING"
    | "MONITORING"
    | "RESOLVED";

  priority: "P0" | "P1" | "P2" | "P3";

  serviceId: string | null;
  ownerMembershipId: string | null;

  services: Array<{
    id: string;
    name: string;
  }>;

  members: Array<{
    id: string;
    userId: string;
    role: "OWNER" | "ADMIN" | "AGENT" | "VIEWER";
  }>;
};

const initialState: UpdateIncidentActionState = {
  status: "idle",
  message: "",
};

export function IncidentDetailsForm({
  workspaceId,
  workspaceSlug,
  incidentId,
  incidentNumber,
  status,
  priority,
  serviceId,
  ownerMembershipId,
  services,
  members,
}: IncidentDetailsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateIncidentAction,
    initialState,
  );

  const fieldClass =
    "mt-2 w-full rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-3.5 py-2.5 text-sm text-[#292b39] outline-none transition focus:border-[#ef5d67] focus:bg-white focus:ring-4 focus:ring-[#ef5d67]/5";

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-[22px] border border-[#eadfe0] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.05)]"
    >
      <input
        type="hidden"
        name="workspaceId"
        value={workspaceId}
      />

      <input
        type="hidden"
        name="workspaceSlug"
        value={workspaceSlug}
      />

      <input
        type="hidden"
        name="incidentId"
        value={incidentId}
      />

      <input
        type="hidden"
        name="incidentNumber"
        value={incidentNumber}
      />

      <div className="border-b border-[#f0e7e8] bg-[#fffafa] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#ef5d67] shadow-[0_0_9px_rgba(239,93,103,0.4)]" />

          <div>
            <p className="text-sm font-semibold">
              Manage response
            </p>

            <p className="mt-1 text-xs text-[#9a9daa]">
              Update incident lifecycle and ownership.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label
            htmlFor="incident-status"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Response status
          </label>

          <select
            id="incident-status"
            name="status"
            defaultValue={status}
            className={fieldClass}
          >
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">
              Investigating
            </option>
            <option value="MONITORING">
              Monitoring
            </option>
            <option value="RESOLVED">
              Resolved
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="incident-priority"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Severity
          </label>

          <select
            id="incident-priority"
            name="priority"
            defaultValue={priority}
            className={fieldClass}
          >
            <option value="P0">P0 — Critical</option>
            <option value="P1">P1 — High</option>
            <option value="P2">P2 — Medium</option>
            <option value="P3">P3 — Low</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="incident-service"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Affected service
          </label>

          <select
            id="incident-service"
            name="serviceId"
            defaultValue={serviceId ?? ""}
            className={fieldClass}
          >
            <option value="">No service</option>

            {services.map((service) => (
              <option
                key={service.id}
                value={service.id}
              >
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="incident-owner"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Incident owner
          </label>

          <select
            id="incident-owner"
            name="ownerMembershipId"
            defaultValue={ownerMembershipId ?? ""}
            className={fieldClass}
          >
            <option value="">Unassigned</option>

            {members.map((member) => (
              <option
                key={member.id}
                value={member.id}
              >
                {member.userId} · {member.role}
              </option>
            ))}
          </select>
        </div>

        {state.status !== "idle" && (
          <div
            className={`rounded-xl px-3.5 py-3 text-xs ${
              state.status === "error"
                ? "border border-[#f1d1d4] bg-[#fff4f5] text-[#d74f5a]"
                : "border border-[#ccebdd] bg-[#eefaf5] text-[#218363]"
            }`}
          >
            {state.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[#17182b] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#17182b]/10 transition hover:bg-[#292a40] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Saving response..."
            : "Save incident changes"}
        </button>
      </div>
    </form>
  );
}