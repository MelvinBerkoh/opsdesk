import {
  calculateTicketSlaDeadlines,
  getTicketSlaTargetStatus,
} from "@/features/tickets/server/ticket-sla";
import { prisma } from "@/server/database/prisma";

type EvaluateTicketSlaInput = {
  workspaceId: string;
  ticketId: string;
  now?: Date;
};

export async function evaluateTicketSla({
  workspaceId,
  ticketId,
  now = new Date(),
}: EvaluateTicketSlaInput) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findFirst({
      where: {
        id: ticketId,
        workspaceId,
      },
      select: {
        id: true,
        workspaceId: true,
        priority: true,
        createdAt: true,
        responseDeadline: true,
        resolutionDeadline: true,
        firstResponseAt: true,
        resolvedAt: true,
        closedAt: true,
        responseWarningAt: true,
        resolutionWarningAt: true,
        responseBreachedAt: true,
        resolutionBreachedAt: true,
      },
    });

    if (!ticket) {
      return null;
    }

    const calculatedDeadlines =
      calculateTicketSlaDeadlines({
        priority: ticket.priority,
        startedAt: ticket.createdAt,
      });

    const responseDeadline =
      ticket.responseDeadline ??
      calculatedDeadlines.responseDeadline;

    const resolutionDeadline =
      ticket.resolutionDeadline ??
      calculatedDeadlines.resolutionDeadline;

    if (
      !ticket.responseDeadline ||
      !ticket.resolutionDeadline
    ) {
      await tx.ticket.updateMany({
        where: {
          id: ticket.id,
          workspaceId,
        },
        data: {
          ...(!ticket.responseDeadline
            ? { responseDeadline }
            : {}),
          ...(!ticket.resolutionDeadline
            ? { resolutionDeadline }
            : {}),
        },
      });
    }

    const responseStatus =
      getTicketSlaTargetStatus({
        startedAt: ticket.createdAt,
        deadline: responseDeadline,
        completedAt: ticket.firstResponseAt,
        now,
      });

    const resolutionStatus =
      getTicketSlaTargetStatus({
        startedAt: ticket.createdAt,
        deadline: resolutionDeadline,
        completedAt:
          ticket.resolvedAt ?? ticket.closedAt,
        now,
      });

    if (
      responseStatus.state === "WARNING" &&
      !ticket.responseWarningAt &&
      !ticket.responseBreachedAt
    ) {
      const update =
        await tx.ticket.updateMany({
          where: {
            id: ticket.id,
            workspaceId,
            responseWarningAt: null,
            responseBreachedAt: null,
          },
          data: {
            responseWarningAt: now,
          },
        });

      if (update.count === 1) {
        await tx.ticketActivity.create({
          data: {
            workspaceId,
            ticketId: ticket.id,
            actorMembershipId: null,
            type: "SLA_WARNING",
            metadata: {
              target: "RESPONSE",
              priority: ticket.priority,
              deadline:
                responseDeadline.toISOString(),
            },
          },
        });
      }
    }

    if (
      responseStatus.state === "BREACHED" &&
      !ticket.responseBreachedAt
    ) {
      const update =
        await tx.ticket.updateMany({
          where: {
            id: ticket.id,
            workspaceId,
            responseBreachedAt: null,
          },
          data: {
            responseBreachedAt: now,
          },
        });

      if (update.count === 1) {
        await tx.ticketActivity.create({
          data: {
            workspaceId,
            ticketId: ticket.id,
            actorMembershipId: null,
            type: "SLA_BREACHED",
            metadata: {
              target: "RESPONSE",
              priority: ticket.priority,
              deadline:
                responseDeadline.toISOString(),
              completedAt:
                ticket.firstResponseAt?.toISOString() ??
                null,
            },
          },
        });
      }
    }

    if (
      resolutionStatus.state === "WARNING" &&
      !ticket.resolutionWarningAt &&
      !ticket.resolutionBreachedAt
    ) {
      const update =
        await tx.ticket.updateMany({
          where: {
            id: ticket.id,
            workspaceId,
            resolutionWarningAt: null,
            resolutionBreachedAt: null,
          },
          data: {
            resolutionWarningAt: now,
          },
        });

      if (update.count === 1) {
        await tx.ticketActivity.create({
          data: {
            workspaceId,
            ticketId: ticket.id,
            actorMembershipId: null,
            type: "SLA_WARNING",
            metadata: {
              target: "RESOLUTION",
              priority: ticket.priority,
              deadline:
                resolutionDeadline.toISOString(),
            },
          },
        });
      }
    }

    if (
      resolutionStatus.state === "BREACHED" &&
      !ticket.resolutionBreachedAt
    ) {
      const update =
        await tx.ticket.updateMany({
          where: {
            id: ticket.id,
            workspaceId,
            resolutionBreachedAt: null,
          },
          data: {
            resolutionBreachedAt: now,
          },
        });

      if (update.count === 1) {
        await tx.ticketActivity.create({
          data: {
            workspaceId,
            ticketId: ticket.id,
            actorMembershipId: null,
            type: "SLA_BREACHED",
            metadata: {
              target: "RESOLUTION",
              priority: ticket.priority,
              deadline:
                resolutionDeadline.toISOString(),
              completedAt:
                (
                  ticket.resolvedAt ??
                  ticket.closedAt
                )?.toISOString() ?? null,
            },
          },
        });
      }
    }

    return {
      responseStatus,
      resolutionStatus,
    };
  });
}
