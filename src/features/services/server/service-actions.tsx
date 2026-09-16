"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  archiveService,
  createService,
  updateService,
} from "./service-management";

export type ServiceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const createServiceActionSchema = z.object({
  workspaceId: z.string().min(1),
  workspaceSlug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateServiceActionSchema =
  createServiceActionSchema.extend({
    serviceId: z.string().min(1),
  });

const archiveServiceActionSchema = z.object({
  workspaceId: z.string().min(1),
  workspaceSlug: z.string().min(1),
  serviceId: z.string().min(1),
});

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

function revalidateServicePages(workspaceSlug: string) {
  revalidatePath(`/workspaces/${workspaceSlug}`);
  revalidatePath(`/workspaces/${workspaceSlug}/services`);
}

export async function createServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const result = createServiceActionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Invalid service information.",
    };
  }

  try {
    await createService({
      workspaceId: result.data.workspaceId,
      name: result.data.name,
      description: result.data.description,
    });

    revalidateServicePages(result.data.workspaceSlug);

    return {
      status: "success",
      message: "Service created.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}

export async function updateServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const result = updateServiceActionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    serviceId: formData.get("serviceId"),
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Invalid service information.",
    };
  }

  try {
    await updateService({
      workspaceId: result.data.workspaceId,
      serviceId: result.data.serviceId,
      name: result.data.name,
      description: result.data.description,
    });

    revalidateServicePages(result.data.workspaceSlug);

    return {
      status: "success",
      message: "Service updated.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}

export async function archiveServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const result = archiveServiceActionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    serviceId: formData.get("serviceId"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Invalid service.",
    };
  }

  try {
    await archiveService({
      workspaceId: result.data.workspaceId,
      serviceId: result.data.serviceId,
    });

    revalidateServicePages(result.data.workspaceSlug);

    return {
      status: "success",
      message: "Service archived.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}