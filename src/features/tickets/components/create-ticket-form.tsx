"use client";

import { useActionState } from "react";

import {
  createTicketAction,
  type CreateTicketActionState,
} from "@/features/tickets/server/create-ticket-action";

type CreateTicketFormProps = {
  workspaceId: string;
  workspaceSlug: string;
  currentMembershipId: string;
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

const initialState: CreateTicketActionState = {
  status: "idle",
  message: "",
};

export function CreateTicketForm({
  workspaceId,
  workspaceSlug,
  currentMembershipId,
  services,
  members,
}: CreateTicketFormProps) {
  const [state, formAction, isPending] = useActionState(
    createTicketAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
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

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-zinc-200"
        >
          Title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={200}
          placeholder="Checkout is failing"
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-200"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          required
          rows={7}
          maxLength={10000}
          placeholder="Describe what is happening, who is affected, and anything already investigated."
          className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-zinc-200"
          >
            Priority
          </label>

          <select
            id="priority"
            name="priority"
            defaultValue="P2"
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none focus:border-zinc-500"
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
            className="block text-sm font-medium text-zinc-200"
          >
            Service
          </label>

          <select
            id="serviceId"
            name="serviceId"
            defaultValue=""
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none focus:border-zinc-500"
          >
            <option value="">No service</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="assigneeMembershipId"
          className="block text-sm font-medium text-zinc-200"
        >
          Assignee
        </label>

        <select
          id="assigneeMembershipId"
          name="assigneeMembershipId"
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none focus:border-zinc-500"
        >
          <option value="">Unassigned</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.id === currentMembershipId
                ? `You (${member.role})`
                : `${member.userId} (${member.role})`}
            </option>
          ))}
        </select>
      </div>

      {state.status === "error" && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating ticket..." : "Create ticket"}
      </button>
    </form>
  );
}