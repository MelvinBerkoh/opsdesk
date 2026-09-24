"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateTicket } from "./update-ticket";

export type UpdateTicketActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const nullableIdSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null) {
      return null;
    }

    return value;
  },
  z.string().min(1).nullable(),
);

const updateTicketActionSchema = z.object({
  workspaceId: z.string().min(1),
  workspaceSlug: z.string().min(1),
  ticketId: z.string().min(1),
  ticketNumber: z.coerce.number().int().positive(),
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "WAITING",
    "RESOLVED",
    "CLOSED",
  ]),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  serviceId: nullableIdSchema,
  assigneeMembershipId: nullableIdSchema,
});

export async function updateTicketAction(
  _previousState: UpdateTicketActionState,
  formData: FormData,
): Promise<UpdateTicketActionState> {
  const result = updateTicketActionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    ticketId: formData.get("ticketId"),
    ticketNumber: formData.get("ticketNumber"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    serviceId: formData.get("serviceId"),
    assigneeMembershipId: formData.get(
      "assigneeMembershipId",
    ),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Check the ticket details and try again.",
    };
  }

  try {
    await updateTicket({
      workspaceId: result.data.workspaceId,
      ticketId: result.data.ticketId,
      status: result.data.status,
      priority: result.data.priority,
      serviceId: result.data.serviceId,
      assigneeMembershipId:
        result.data.assigneeMembershipId,
    });

    revalidatePath(
      `/workspaces/${result.data.workspaceSlug}/tickets`,
    );

    revalidatePath(
      `/workspaces/${result.data.workspaceSlug}/tickets/${result.data.ticketNumber}`,
    );

    return {
      status: "success",
      message: "Ticket updated.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to update ticket.",
    };
  }
}