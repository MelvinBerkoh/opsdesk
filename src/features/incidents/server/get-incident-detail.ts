import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/server/database/prisma";

export async function getIncidentDetail(
  workspaceSlug: string,
  incidentNumber: number,
) {
  const { userId } = await auth.protect();

  const incident = await prisma.incident.findFirst({
    where: {
      number: incidentNumber,
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
      resolvedAt: true,
      createdAt: true,
      updatedAt: true,

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

      owner: {
        select: {
          id: true,
          userId: true,
        },
      },

      sourceTicket: {
        select: {
          id: true,
          number: true,
          title: true,
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

  if (!incident) {
    return null;
  }

  const currentMembership =
    incident.workspace.memberships.find(
      (membership) => membership.userId === userId,
    );

  if (!currentMembership) {
    return null;
  }

  return {
    incident,
    currentMembership,
  };
}