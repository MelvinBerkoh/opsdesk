import { z } from "zod";

import { requireWorkspacePermission } from "@/server/authorization/require-workspace-permission";
import { prisma } from "@/server/database/prisma";

const ticketStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "WAITING",
  "RESOLVED",
  "CLOSED",
]);

const ticketPrioritySchema = z.enum([
  "P0",
  "P1",
  "P2",
  "P3",
]);

const updateTicketSchema = z.object({
  workspaceId: z.string().min(1),
  ticketId: z.string().min(1),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  serviceId: z.string().min(1).nullable().optional(),
  assigneeMembershipId: z
    .string()
    .min(1)
    .nullable()
    .optional(),
});

export class UpdateTicketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpdateTicketError";
  }
}

export async function updateTicket(input: unknown) {
  const parsed = updateTicketSchema.parse(input);

  const actor = await requireWorkspacePermission({
    workspaceId: parsed.workspaceId,
    permission: "tickets:manage",
  });

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findFirst({
      where: {
        id: parsed.ticketId,
        workspaceId: parsed.workspaceId,
      },
      select: {
        id: true,
        status: true,
        priority: true,
        serviceId: true,
        assigneeMembershipId: true,
        resolvedAt: true,
        closedAt: true,
      },
    });

    if (!ticket) {
      throw new UpdateTicketError("Ticket not found.");
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
        throw new UpdateTicketError(
          "Selected service is not available.",
        );
      }
    }

    if (parsed.assigneeMembershipId) {
      const assignee = await tx.membership.findFirst({
        where: {
          id: parsed.assigneeMembershipId,
          workspaceId: parsed.workspaceId,
          removedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!assignee) {
        throw new UpdateTicketError(
          "Selected assignee is not an active member.",
        );
      }
    }

    const now = new Date();

    const data: {
      status?:
        | "OPEN"
        | "IN_PROGRESS"
        | "WAITING"
        | "RESOLVED"
        | "CLOSED";
      priority?: "P0" | "P1" | "P2" | "P3";
      serviceId?: string | null;
      assigneeMembershipId?: string | null;
      resolvedAt?: Date | null;
      closedAt?: Date | null;
    } = {};

    const activities: Array<{
      type:
        | "STATUS_CHANGED"
        | "PRIORITY_CHANGED"
        | "ASSIGNEE_CHANGED"
        | "SERVICE_CHANGED"
        | "RESOLVED"
        | "CLOSED"
        | "REOPENED";
      metadata: Record<string, string | null>;
    }> = [];

    if (
      parsed.status !== undefined &&
      parsed.status !== ticket.status
    ) {
      data.status = parsed.status;

      if (parsed.status === "RESOLVED") {
        data.resolvedAt = now;
        data.closedAt = null;
      } else if (parsed.status === "CLOSED") {
        data.closedAt = now;
      } else if (
        ticket.status === "RESOLVED" ||
        ticket.status === "CLOSED"
      ) {
        data.resolvedAt = null;
        data.closedAt = null;
      }

      let type:
        | "STATUS_CHANGED"
        | "RESOLVED"
        | "CLOSED"
        | "REOPENED" = "STATUS_CHANGED";

      if (parsed.status === "RESOLVED") {
        type = "RESOLVED";
      } else if (parsed.status === "CLOSED") {
        type = "CLOSED";
      } else if (
        ticket.status === "RESOLVED" ||
        ticket.status === "CLOSED"
      ) {
        type = "REOPENED";
      }

      activities.push({
        type,
        metadata: {
          from: ticket.status,
          to: parsed.status,
        },
      });
    }

    if (
      parsed.priority !== undefined &&
      parsed.priority !== ticket.priority
    ) {
      data.priority = parsed.priority;

      activities.push({
        type: "PRIORITY_CHANGED",
        metadata: {
          from: ticket.priority,
          to: parsed.priority,
        },
      });
    }

    if (
      parsed.serviceId !== undefined &&
      parsed.serviceId !== ticket.serviceId
    ) {
      data.serviceId = parsed.serviceId;

      activities.push({
        type: "SERVICE_CHANGED",
        metadata: {
          from: ticket.serviceId,
          to: parsed.serviceId,
        },
      });
    }

    if (
      parsed.assigneeMembershipId !== undefined &&
      parsed.assigneeMembershipId !==
        ticket.assigneeMembershipId
    ) {
      data.assigneeMembershipId =
        parsed.assigneeMembershipId;

      activities.push({
        type: "ASSIGNEE_CHANGED",
        metadata: {
          from: ticket.assigneeMembershipId,
          to: parsed.assigneeMembershipId,
        },
      });
    }

    if (activities.length === 0) {
      return ticket;
    }

    const updateResult = await tx.ticket.updateMany({
      where: {
        id: ticket.id,
        workspaceId: parsed.workspaceId,
      },
      data,
    });

    if (updateResult.count !== 1) {
      throw new UpdateTicketError(
        "Ticket could not be updated.",
      );
    }

    for (const activity of activities) {
      await tx.ticketActivity.create({
        data: {
          workspaceId: parsed.workspaceId,
          ticketId: ticket.id,
          actorMembershipId: actor.id,
          type: activity.type,
          metadata: activity.metadata,
        },
      });
    }

    return tx.ticket.findFirst({
      where: {
        id: ticket.id,
        workspaceId: parsed.workspaceId,
      },
    });
  });
}