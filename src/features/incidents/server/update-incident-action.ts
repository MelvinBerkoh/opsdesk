"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateIncident } from "./update-incident";

export type UpdateIncidentActionState = {
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

const updateIncidentActionSchema = z.object({
  workspaceId: z.string().min(1),
  workspaceSlug: z.string().min(1),
  incidentId: z.string().min(1),
  incidentNumber: z.coerce.number().int().positive(),

  status: z.enum([
    "OPEN",
    "INVESTIGATING",
    "MONITORING",
    "RESOLVED",
  ]),

  priority: z.enum(["P0", "P1", "P2", "P3"]),

  serviceId: nullableIdSchema,
  ownerMembershipId: nullableIdSchema,
});

export async function updateIncidentAction(
  _previousState: UpdateIncidentActionState,
  formData: FormData,
): Promise<UpdateIncidentActionState> {
  const result = updateIncidentActionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    incidentId: formData.get("incidentId"),
    incidentNumber: formData.get("incidentNumber"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    serviceId: formData.get("serviceId"),
    ownerMembershipId: formData.get(
      "ownerMembershipId",
    ),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Check the incident details and try again.",
    };
  }

  try {
    await updateIncident({
      workspaceId: result.data.workspaceId,
      incidentId: result.data.incidentId,
      status: result.data.status,
      priority: result.data.priority,
      serviceId: result.data.serviceId,
      ownerMembershipId:
        result.data.ownerMembershipId,
    });

    revalidatePath(
      `/workspaces/${result.data.workspaceSlug}/incidents`,
    );

    revalidatePath(
      `/workspaces/${result.data.workspaceSlug}/incidents/${result.data.incidentNumber}`,
    );

    revalidatePath(
      `/workspaces/${result.data.workspaceSlug}`,
    );

    return {
      status: "success",
      message: "Incident updated.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to update incident.",
    };
  }
}