import { z } from "zod";

import { requireWorkspacePermission } from "@/server/authorization/require-workspace-permission";
import { prisma } from "@/server/database/prisma";

const escalateTicketSchema = z.object({
  workspaceId: z.string().min(1),
  ticketId: z.string().min(1),
});

export class IncidentEscalationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IncidentEscalationError";
  }
}

export async function escalateTicketToIncident(
  input: unknown,
) {
  const parsed = escalateTicketSchema.parse(input);

  const actor = await requireWorkspacePermission({
    workspaceId: parsed.workspaceId,
    permission: "incidents:manage",
  });

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findFirst({
      where: {
        id: parsed.ticketId,
        workspaceId: parsed.workspaceId,
      },
      select: {
        id: true,
        number: true,
        title: true,
        description: true,
        priority: true,
        serviceId: true,
      },
    });

    if (!ticket) {
      throw new IncidentEscalationError(
        "Ticket not found.",
      );
    }

    const existingIncident =
      await tx.incident.findUnique({
        where: {
          sourceTicketId: ticket.id,
        },
        select: {
          id: true,
          number: true,
        },
      });

    if (existingIncident) {
      throw new IncidentEscalationError(
        `This ticket is already linked to INC-${String(
          existingIncident.number,
        ).padStart(4, "0")}.`,
      );
    }

    const workspace = await tx.workspace.update({
      where: {
        id: parsed.workspaceId,
      },
      data: {
        incidentSequence: {
          increment: 1,
        },
      },
      select: {
        incidentSequence: true,
      },
    });

    const incident = await tx.incident.create({
      data: {
        workspaceId: parsed.workspaceId,
        number: workspace.incidentSequence,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: "OPEN",
        serviceId: ticket.serviceId,
        ownerMembershipId: actor.id,
        sourceTicketId: ticket.id,
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
        ownerMembershipId: true,
        sourceTicketId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.incidentActivity.create({
      data: {
        workspaceId: parsed.workspaceId,
        incidentId: incident.id,
        actorMembershipId: actor.id,
        type: "CREATED",
        metadata: {
          priority: incident.priority,
          status: incident.status,
        },
      },
    });

    await tx.incidentActivity.create({
      data: {
        workspaceId: parsed.workspaceId,
        incidentId: incident.id,
        actorMembershipId: actor.id,
        type: "TICKET_LINKED",
        metadata: {
          ticketId: ticket.id,
          ticketNumber: ticket.number,
        },
      },
    });

    await tx.ticketActivity.create({
      data: {
        workspaceId: parsed.workspaceId,
        ticketId: ticket.id,
        actorMembershipId: actor.id,
        type: "INCIDENT_LINKED",
        metadata: {
          incidentId: incident.id,
          incidentNumber: incident.number,
        },
      },
    });

    return incident;
  });
}