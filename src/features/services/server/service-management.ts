import { z } from "zod";

import { requireWorkspacePermission } from "@/server/authorization/require-workspace-permission";
import { prisma } from "@/server/database/prisma";

const serviceNameSchema = z
  .string()
  .trim()
  .min(2, "Service name must be at least 2 characters.")
  .max(100, "Service name must be 100 characters or fewer.");

const serviceDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Description must be 500 characters or fewer.")
  .optional()
  .nullable();

const createServiceSchema = z.object({
  workspaceId: z.string().min(1),
  name: serviceNameSchema,
  description: serviceDescriptionSchema,
});

const updateServiceSchema = createServiceSchema.extend({
  serviceId: z.string().min(1),
});

const archiveServiceSchema = z.object({
  workspaceId: z.string().min(1),
  serviceId: z.string().min(1),
});

export class ServiceManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceManagementError";
  }
}

export function createServiceSlug(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  if (!slug) {
    throw new ServiceManagementError(
      "Service name must contain at least one letter or number.",
    );
  }

  return slug;
}

function normalizeDescription(
  description: string | null | undefined,
) {
  if (!description) {
    return null;
  }

  const trimmed = description.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export async function createService(input: unknown) {
  const parsed = createServiceSchema.parse(input);

  await requireWorkspacePermission({
    workspaceId: parsed.workspaceId,
    permission: "services:manage",
  });

  const slug = createServiceSlug(parsed.name);

  const existingService = await prisma.service.findFirst({
    where: {
      workspaceId: parsed.workspaceId,
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingService) {
    throw new ServiceManagementError(
      "A service with this name already exists in the workspace.",
    );
  }

  return prisma.service.create({
    data: {
      workspaceId: parsed.workspaceId,
      name: parsed.name,
      slug,
      description: normalizeDescription(parsed.description),
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      slug: true,
      description: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateService(input: unknown) {
  const parsed = updateServiceSchema.parse(input);

  await requireWorkspacePermission({
    workspaceId: parsed.workspaceId,
    permission: "services:manage",
  });

  const target = await prisma.service.findFirst({
    where: {
      id: parsed.serviceId,
      workspaceId: parsed.workspaceId,
      archivedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!target) {
    throw new ServiceManagementError(
      "Active service not found.",
    );
  }

  const slug = createServiceSlug(parsed.name);

  const conflictingService = await prisma.service.findFirst({
    where: {
      workspaceId: parsed.workspaceId,
      slug,
      NOT: {
        id: target.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (conflictingService) {
    throw new ServiceManagementError(
      "A service with this name already exists in the workspace.",
    );
  }

  const result = await prisma.service.updateMany({
    where: {
      id: target.id,
      workspaceId: parsed.workspaceId,
      archivedAt: null,
    },
    data: {
      name: parsed.name,
      slug,
      description: normalizeDescription(parsed.description),
    },
  });

  if (result.count !== 1) {
    throw new ServiceManagementError(
      "This service is no longer available.",
    );
  }

  return prisma.service.findFirst({
    where: {
      id: target.id,
      workspaceId: parsed.workspaceId,
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      slug: true,
      description: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function archiveService(input: unknown) {
  const parsed = archiveServiceSchema.parse(input);

  await requireWorkspacePermission({
    workspaceId: parsed.workspaceId,
    permission: "services:manage",
  });

  const archivedAt = new Date();

  const result = await prisma.service.updateMany({
    where: {
      id: parsed.serviceId,
      workspaceId: parsed.workspaceId,
      archivedAt: null,
    },
    data: {
      archivedAt,
    },
  });

  if (result.count !== 1) {
    throw new ServiceManagementError(
      "Active service not found.",
    );
  }

  return {
    serviceId: parsed.serviceId,
    archivedAt,
  };
}