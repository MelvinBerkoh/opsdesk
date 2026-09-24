import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/server/database/prisma";

export async function getTicketDetail(
  workspaceSlug: string,
  ticketNumber: number,
) {
  const { userId } = await auth.protect();

  const ticket = await prisma.ticket.findFirst({
    where: {
      number: ticketNumber,
      workspace: {
        slug: workspaceSlug,
        memberships: {
          some: {
            userId,
            removedAt: null,
          },
        },
      },
    },
    select: {
      id: true,
      number: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
      closedAt: true,

      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,

          memberships: {
            where: {
              removedAt: null,
            },
            orderBy: {
              joinedAt: "asc",
            },
            select: {
              id: true,
              userId: true,
              role: true,
            },
          },

          services: {
            where: {
              archivedAt: null,
            },
            orderBy: {
              name: "asc",
            },
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      service: {
        select: {
          id: true,
          name: true,
        },
      },

      reporter: {
        select: {
          id: true,
          userId: true,
        },
      },

      assignee: {
        select: {
          id: true,
          userId: true,
        },
      },

      activities: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          type: true,
          metadata: true,
          createdAt: true,

          actor: {
            select: {
              id: true,
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    return null;
  }

  const currentMembership =
    ticket.workspace.memberships.find(
      (membership) => membership.userId === userId,
    );

  if (!currentMembership) {
    return null;
  }

  return {
    ticket,
    currentMembership,
  };
}