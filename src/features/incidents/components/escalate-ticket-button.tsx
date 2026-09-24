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
      className="relative overflow-hidden rounded-[22px] bg-[#17182b] p-5 text-white shadow-xl shadow-[#17182b]/10"
    >
      <div className="absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[#ef5d67]/15 blur-2xl" />

      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input
        type="hidden"
        name="workspaceSlug"
        value={workspaceSlug}
      />
      <input type="hidden" name="ticketId" value={ticketId} />
      <input
        type="hidden"
        name="ticketNumber"
        value={ticketNumber}
      />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef5d67]/15 text-[#ff8f97]">
            ⚡
          </div>

          <div>
            <p className="text-sm font-semibold">
              Incident escalation
            </p>

            <p className="mt-0.5 text-[11px] text-white/35">
              High-impact response
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-white/45">
          If this issue requires coordinated response, promote it
          into an incident without losing the ticket context.
        </p>

        <div className="mt-5 flex items-center gap-2 text-[10px] text-white/30">
          <span className="rounded-lg bg-white/[0.06] px-2.5 py-1.5">
            TKT-{String(ticketNumber).padStart(4, "0")}
          </span>

          <span>→</span>

          <span className="rounded-lg bg-[#ef5d67]/10 px-2.5 py-1.5 text-[#ff8f97]">
            INCIDENT
          </span>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17182b] transition hover:bg-[#f2f2f7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Escalating..."
            : "Escalate to incident →"}
        </button>

        {state.status === "error" && (
          <p className="mt-3 text-xs text-[#ff8f97]">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}