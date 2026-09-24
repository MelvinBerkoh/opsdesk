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

  return (
    <form
      action={formAction}
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
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

      <h3 className="font-semibold">
        Manage incident
      </h3>

      <div className="mt-5 space-y-5">
        <div>
          <label
            htmlFor="status"
            className="block text-sm text-zinc-500"
          >
            Status
          </label>

          <select
            id="status"
            name="status"
            defaultValue={status}
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          >
            <option value="OPEN">
              Open
            </option>

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
            htmlFor="priority"
            className="block text-sm text-zinc-500"
          >
            Priority
          </label>

          <select
            id="priority"
            name="priority"
            defaultValue={priority}
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          >
            <option value="P0">
              P0 — Critical
            </option>

            <option value="P1">
              P1 — High
            </option>

            <option value="P2">
              P2 — Medium
            </option>

            <option value="P3">
              P3 — Low
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="serviceId"
            className="block text-sm text-zinc-500"
          >
            Service
          </label>

          <select
            id="serviceId"
            name="serviceId"
            defaultValue={serviceId ?? ""}
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          >
            <option value="">
              No service
            </option>

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
            htmlFor="ownerMembershipId"
            className="block text-sm text-zinc-500"
          >
            Owner
          </label>

          <select
            id="ownerMembershipId"
            name="ownerMembershipId"
            defaultValue={ownerMembershipId ?? ""}
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          >
            <option value="">
              Unassigned
            </option>

            {members.map((member) => (
              <option
                key={member.id}
                value={member.id}
              >
                {member.userId} ({member.role})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Saving..."
            : "Save changes"}
        </button>

        {state.status !== "idle" && (
          <p
            className={`text-sm ${
              state.status === "error"
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}