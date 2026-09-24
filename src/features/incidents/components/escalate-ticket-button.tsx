"use client";

import { useActionState } from "react";

import {
  escalateTicketAction,
  type EscalateTicketActionState,
} from "@/features/incidents/server/escalate-ticket-action";

type EscalateTicketButtonProps = {
  workspaceId: string;
  workspaceSlug: string;
  ticketId: string;
  ticketNumber: number;
};

const initialState: EscalateTicketActionState = {
  status: "idle",
  message: "",
};

export function EscalateTicketButton({
  workspaceId,
  workspaceSlug,
  ticketId,
  ticketNumber,
}: EscalateTicketButtonProps) {
  const [state, formAction, isPending] = useActionState(
    escalateTicketAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-xl border border-red-900/60 bg-red-950/20 p-5"
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

      <h3 className="font-semibold text-red-300">
        Escalate
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Turn this ticket into an incident when the issue
        requires coordinated incident response.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full rounded-lg border border-red-800 bg-red-950 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Escalating..."
          : "Escalate to incident"}
      </button>

      {state.status === "error" && (
        <p className="mt-3 text-sm text-red-400">
          {state.message}
        </p>
      )}
    </form>
  );
}