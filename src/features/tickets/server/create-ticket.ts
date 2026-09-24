import { z } from "zod";

import { requireWorkspacePermission } from "@/server/authorization/require-workspace-permission";
import { prisma } from "@/server/database/prisma";

const optionalIdSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return null;
    }

    return value;
  },
  z.string().min(1).nullable().optional(),
);

const createTicketSchema = z.object({
  workspaceId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(2, "Ticket title must be at least 2 characters.")
    .max(200, "Ticket title must be 200 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(1, "Ticket description is required.")
    .max(10_000, "Ticket description is too long."),
  priority: z.enum(["P0", "P1", "P2", "P3"]).default("P2"),
  serviceId: optionalIdSchema,
  assigneeMembershipId: optionalIdSchema,
});

export class TicketManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TicketManagementError";
  }
}

export async function createTicket(input: unknown) {
  const parsed = createTicketSchema.parse(input);

  const reporter = await requireWorkspacePermission({
    workspaceId: parsed.workspaceId,
    permission: "tickets:manage",
  });

  return prisma.$transaction(async (tx) => {
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
        throw new TicketManagementError(
          "Selected service is not available in this workspace.",
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
        throw new TicketManagementError(
          "Selected assignee is not an active member of this workspace.",
        );
      }
    }

    const workspace = await tx.workspace.update({
      where: {
        id: parsed.workspaceId,
      },
      data: {
        ticketSequence: {
          increment: 1,
        },
      },
      select: {
        ticketSequence: true,
      },
    });

    const ticket = await tx.ticket.create({
      data: {
        workspaceId: parsed.workspaceId,
        number: workspace.ticketSequence,
        title: parsed.title,
        description: parsed.description,
        priority: parsed.priority,
        status: "OPEN",
        serviceId: parsed.serviceId ?? null,
        reporterMembershipId: reporter.id,
        assigneeMembershipId:
          parsed.assigneeMembershipId ?? null,
      },
      select: {
        id: true,
        workspaceId: true,
        number: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        serviceId: true,
        reporterMembershipId: true,
        assigneeMembershipId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.ticketActivity.create({
      data: {
        workspaceId: parsed.workspaceId,
        ticketId: ticket.id,
        actorMembershipId: reporter.id,
        type: "CREATED",
        metadata: {
          status: "OPEN",
          priority: parsed.priority,
        },
      },
    });

    return ticket;
  });
}