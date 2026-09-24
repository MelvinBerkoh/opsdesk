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
        name="ticketId"
        value={ticketId}
      />

      <input
        type="hidden"
        name="ticketNumber"
        value={ticketNumber}
      />

      <h3 className="font-semibold">Manage ticket</h3>

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
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">
              In progress
            </option>
            <option value="WAITING">Waiting</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
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
            <option value="P0">P0 — Critical</option>
            <option value="P1">P1 — High</option>
            <option value="P2">P2 — Medium</option>
            <option value="P3">P3 — Low</option>
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
            htmlFor="assigneeMembershipId"
            className="block text-sm text-zinc-500"
          >
            Assignee
          </label>

          <select
            id="assigneeMembershipId"
            name="assigneeMembershipId"
            defaultValue={assigneeMembershipId ?? ""}
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          >
            <option value="">Unassigned</option>

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
          {isPending ? "Saving..." : "Save changes"}
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