"use client";

import { useActionState } from "react";

import {
  type UpdateTicketActionState,
  updateTicketAction,
} from "@/features/tickets/server/update-ticket-action";

type TicketDetailsFormProps = {
  workspaceId: string;
  workspaceSlug: string;
  ticketId: string;
  ticketNumber: number;
  status:
    | "OPEN"
    | "IN_PROGRESS"
    | "WAITING"
    | "RESOLVED"
    | "CLOSED";
  priority: "P0" | "P1" | "P2" | "P3";
  serviceId: string | null;
  assigneeMembershipId: string | null;
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

const initialState: UpdateTicketActionState = {
  status: "idle",
  message: "",
};

export function TicketDetailsForm({
  workspaceId,
  workspaceSlug,
  ticketId,
  ticketNumber,
  status,
  priority,
  serviceId,
  assigneeMembershipId,
  services,
  members,
}: TicketDetailsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateTicketAction,
    initialState,
  );

  const fieldClass =
    "mt-2 w-full rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-3.5 py-2.5 text-sm text-[#292b39] outline-none transition focus:border-[#6d5dfc] focus:bg-white focus:ring-4 focus:ring-[#6d5dfc]/5";

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-[22px] border border-[#e4e6ed] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.05)]"
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="ticketNumber" value={ticketNumber} />

      <div className="border-b border-[#eff0f4] px-5 py-4">
        <p className="text-sm font-semibold">Manage ticket</p>

        <p className="mt-1 text-xs text-[#9a9daa]">
          Update routing and lifecycle.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label
            htmlFor="status"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Status
          </label>

          <select
            id="status"
            name="status"
            defaultValue={status}
            className={fieldClass}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="WAITING">Waiting</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Priority
          </label>

          <select
            id="priority"
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
            htmlFor="serviceId"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Service
          </label>

          <select
            id="serviceId"
            name="serviceId"
            defaultValue={serviceId ?? ""}
            className={fieldClass}
          >
            <option value="">No service</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="assigneeMembershipId"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Assignee
          </label>

          <select
            id="assigneeMembershipId"
            name="assigneeMembershipId"
            defaultValue={assigneeMembershipId ?? ""}
            className={fieldClass}
          >
            <option value="">Unassigned</option>

            {members.map((member) => (
              <option key={member.id} value={member.id}>
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
          className="w-full rounded-xl bg-[#6d5dfc] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6d5dfc]/15 transition hover:bg-[#5e4fe8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}