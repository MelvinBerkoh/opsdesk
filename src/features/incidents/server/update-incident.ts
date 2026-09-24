import { z } from "zod";

import { requireWorkspacePermission } from "@/server/authorization/require-workspace-permission";
import { prisma } from "@/server/database/prisma";

const updateIncidentSchema = z.object({
  workspaceId: z.string().min(1),
  incidentId: z.string().min(1),

  status: z
    .enum([
      "OPEN",
      "INVESTIGATING",
      "MONITORING",
      "RESOLVED",
    ])
    .optional(),

  priority: z
    .enum(["P0", "P1", "P2", "P3"])
    .optional(),

  serviceId: z.string().min(1).nullable().optional(),

  ownerMembershipId: z
    .string()
    .min(1)
    .nullable()
    .optional(),
});

export class UpdateIncidentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpdateIncidentError";
  }
}

export async function updateIncident(input: unknown) {
  const parsed = updateIncidentSchema.parse(input);

  const actor = await requireWorkspacePermission({
    workspaceId: parsed.workspaceId,
    permission: "incidents:manage",
  });

  return prisma.$transaction(async (tx) => {
    const incident = await tx.incident.findFirst({
      where: {
        id: parsed.incidentId,
        workspaceId: parsed.workspaceId,
      },
      select: {
        id: true,
        status: true,
        priority: true,
        serviceId: true,
        ownerMembershipId: true,
        resolvedAt: true,
      },
    });

    if (!incident) {
      throw new UpdateIncidentError(
        "Incident not found.",
      );
    }

    if (parsed.serviceId) {
      const service = await tx.service.findFirst({
        where: {
          id: parsed.serviceId,
          workspaceId: parsed.workspaceId,
          archivedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!service) {
        throw new UpdateIncidentError(
          "Selected service is not available.",
        );
      }
    }

    if (parsed.ownerMembershipId) {
      const owner = await tx.membership.findFirst({
        where: {
          id: parsed.ownerMembershipId,
          workspaceId: parsed.workspaceId,
          removedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!owner) {
        throw new UpdateIncidentError(
          "Selected owner is not an active member.",
        );
      }
    }

    const now = new Date();

    const data: {
      status?:
        | "OPEN"
        | "INVESTIGATING"
        | "MONITORING"
        | "RESOLVED";
      priority?: "P0" | "P1" | "P2" | "P3";
      serviceId?: string | null;
      ownerMembershipId?: string | null;
      resolvedAt?: Date | null;
    } = {};

    const activities: Array<{
      type:
        | "STATUS_CHANGED"
        | "PRIORITY_CHANGED"
        | "OWNER_CHANGED"
        | "SERVICE_CHANGED"
        | "RESOLVED"
        | "REOPENED";
      metadata: Record<string, string | null>;
    }> = [];

    if (
      parsed.status !== undefined &&
      parsed.status !== incident.status
    ) {
      data.status = parsed.status;

      if (parsed.status === "RESOLVED") {
        data.resolvedAt = now;
      } else if (incident.status === "RESOLVED") {
        data.resolvedAt = null;
      }

      let type:
        | "STATUS_CHANGED"
        | "RESOLVED"
        | "REOPENED" = "STATUS_CHANGED";

      if (parsed.status === "RESOLVED") {
        type = "RESOLVED";
      } else if (incident.status === "RESOLVED") {
        type = "REOPENED";
      }

      activities.push({
        type,
        metadata: {
          from: incident.status,
          to: parsed.status,
        },
      });
    }

    if (
      parsed.priority !== undefined &&
      parsed.priority !== incident.priority
    ) {
      data.priority = parsed.priority;

      activities.push({
        type: "PRIORITY_CHANGED",
        metadata: {
          from: incident.priority,
          to: parsed.priority,
        },
      });
    }

    if (
      parsed.serviceId !== undefined &&
      parsed.serviceId !== incident.serviceId
    ) {
      data.serviceId = parsed.serviceId;

      activities.push({
        type: "SERVICE_CHANGED",
        metadata: {
          from: incident.serviceId,
          to: parsed.serviceId,
        },
      });
    }

    if (
      parsed.ownerMembershipId !== undefined &&
      parsed.ownerMembershipId !==
        incident.ownerMembershipId
    ) {
      data.ownerMembershipId =
        parsed.ownerMembershipId;

      activities.push({
        type: "OWNER_CHANGED",
        metadata: {
          from: incident.ownerMembershipId,
          to: parsed.ownerMembershipId,
        },
      });
    }

    if (activities.length === 0) {
      return incident;
    }

    const updateResult =
      await tx.incident.updateMany({
        where: {
          id: incident.id,
          workspaceId: parsed.workspaceId,
        },
        data,
      });

    if (updateResult.count !== 1) {
      throw new UpdateIncidentError(
        "Incident could not be updated.",
      );
    }

    for (const activity of activities) {
      await tx.incidentActivity.create({
        data: {
          workspaceId: parsed.workspaceId,
          incidentId: incident.id,
          actorMembershipId: actor.id,
          type: activity.type,
          metadata: activity.metadata,
        },
      });
    }

    return tx.incident.findFirst({
      where: {
        id: incident.id,
        workspaceId: parsed.workspaceId,
      },
    });
  });
}