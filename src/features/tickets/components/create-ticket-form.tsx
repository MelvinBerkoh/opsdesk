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

  const fieldClass =
    "mt-2 w-full rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-4 py-3 text-sm text-[#202230] outline-none transition placeholder:text-[#b0b3bd] focus:border-[#6d5dfc] focus:bg-white focus:ring-4 focus:ring-[#6d5dfc]/5";

  return (
    <form
      action={formAction}
      className="rounded-[24px] border border-[#e4e6ed] bg-white shadow-[0_12px_40px_rgba(37,39,64,0.055)]"
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

      <div className="border-b border-[#eff0f4] px-6 py-5 sm:px-8">
        <h2 className="font-semibold text-[#272936]">
          Ticket details
        </h2>

        <p className="mt-1 text-xs text-[#9a9daa]">
          Provide enough context for someone else to understand
          and investigate the issue.
        </p>
      </div>

      <div className="space-y-7 p-6 sm:p-8">
        <div>
          <label
            htmlFor="title"
            className="text-sm font-medium text-[#555966]"
          >
            Ticket title
          </label>

          <p className="mt-1 text-xs text-[#a0a3ae]">
            Keep it short and describe the actual problem.
          </p>

          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={200}
            placeholder="Checkout payments are failing"
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="text-sm font-medium text-[#555966]"
          >
            Description
          </label>

          <p className="mt-1 text-xs text-[#a0a3ae]">
            Include impact, symptoms, and anything already
            investigated.
          </p>

          <textarea
            id="description"
            name="description"
            required
            rows={8}
            maxLength={10000}
            placeholder="Customers receive an authorization error when submitting payment..."
            className={`${fieldClass} resize-y`}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="priority"
              className="text-sm font-medium text-[#555966]"
            >
              Priority
            </label>

            <select
              id="priority"
              name="priority"
              defaultValue="P2"
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
              className="text-sm font-medium text-[#555966]"
            >
              Affected service
            </label>

            <select
              id="serviceId"
              name="serviceId"
              defaultValue=""
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
        </div>

        <div>
          <label
            htmlFor="assigneeMembershipId"
            className="text-sm font-medium text-[#555966]"
          >
            Assignee
          </label>

          <select
            id="assigneeMembershipId"
            name="assigneeMembershipId"
            defaultValue=""
            className={fieldClass}
          >
            <option value="">Leave unassigned</option>

            {members.map((member) => (
              <option
                key={member.id}
                value={member.id}
              >
                {member.id === currentMembershipId
                  ? `You · ${member.role}`
                  : `${member.userId} · ${member.role}`}
              </option>
            ))}
          </select>
        </div>

        {state.status === "error" && (
          <div className="rounded-xl border border-[#f3d2d5] bg-[#fff4f5] px-4 py-3 text-sm text-[#d64e5a]">
            {state.message}
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#eff0f4] bg-[#fafbfc] px-6 py-5 sm:flex-row sm:items-center sm:px-8">
        <p className="text-xs text-[#a0a3ae]">
          The ticket will start with an Open status.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#6d5dfc] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6d5dfc]/15 transition hover:bg-[#5e4fe8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating ticket..." : "Create ticket →"}
        </button>
      </div>
    </form>
  );
}