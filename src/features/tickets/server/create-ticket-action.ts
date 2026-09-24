"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createTicket } from "./create-ticket";

export type CreateTicketActionState = {
  status: "idle" | "error";
  message: string;
};

const createTicketActionSchema = z.object({
  workspaceId: z.string().min(1),
  workspaceSlug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  serviceId: z.string().optional(),
  assigneeMembershipId: z.string().optional(),
});

export async function createTicketAction(
  _previousState: CreateTicketActionState,
  formData: FormData,
): Promise<CreateTicketActionState> {
  const result = createTicketActionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    serviceId: formData.get("serviceId"),
    assigneeMembershipId: formData.get(
      "assigneeMembershipId",
    ),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Check the ticket information and try again.",
    };
  }

  try {
    await createTicket({
      workspaceId: result.data.workspaceId,
      title: result.data.title,
      description: result.data.description,
      priority: result.data.priority,
      serviceId: result.data.serviceId,
      assigneeMembershipId:
        result.data.assigneeMembershipId,
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to create ticket.",
    };
  }

  revalidatePath(
    `/workspaces/${result.data.workspaceSlug}/tickets`,
  );

  redirect(
    `/workspaces/${result.data.workspaceSlug}/tickets`,
  );
}