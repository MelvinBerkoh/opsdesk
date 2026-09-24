"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { escalateTicketToIncident } from "./escalate-ticket-to-incident";

export type EscalateTicketActionState = {
  status: "idle" | "error";
  message: string;
};

const escalateTicketActionSchema = z.object({
  workspaceId: z.string().min(1),
  workspaceSlug: z.string().min(1),
  ticketId: z.string().min(1),
  ticketNumber: z.coerce.number().int().positive(),
});

export async function escalateTicketAction(
  _previousState: EscalateTicketActionState,
  formData: FormData,
): Promise<EscalateTicketActionState> {
  const result = escalateTicketActionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    ticketId: formData.get("ticketId"),
    ticketNumber: formData.get("ticketNumber"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Unable to escalate this ticket.",
    };
  }

  let incidentNumber: number;

  try {
    const incident = await escalateTicketToIncident({
      workspaceId: result.data.workspaceId,
      ticketId: result.data.ticketId,
    });

    incidentNumber = incident.number;
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to escalate this ticket.",
    };
  }

  revalidatePath(
    `/workspaces/${result.data.workspaceSlug}/tickets/${result.data.ticketNumber}`,
  );

  revalidatePath(
    `/workspaces/${result.data.workspaceSlug}/incidents`,
  );

  redirect(
    `/workspaces/${result.data.workspaceSlug}/incidents/${incidentNumber}`,
  );
}