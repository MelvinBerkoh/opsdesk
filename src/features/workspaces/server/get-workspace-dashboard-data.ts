import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/server/database/prisma";

export async function getWorkspaceDashboardData(
  slug: string,
) {
  const { userId } = await auth.protect();

  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      memberships: {
        some: {
          userId,
          removedAt: null,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,

      memberships: {
        where: {
          userId,
          removedAt: null,
        },
        select: {
          id: true,
          role: true,
        },
        take: 1,
      },
    },
  });

  if (!workspace) {
    return null;
  }

  const membership = workspace.memberships[0];

  if (!membership) {
    return null;
  }

  const [
    openTickets,
    unassignedTickets,
    activeIncidents,
    criticalIncidents,
    recentTickets,
    recentIncidents,
  ] = await Promise.all([
    prisma.ticket.count({
      where: {
        workspaceId: workspace.id,
        status: {
          notIn: ["RESOLVED", "CLOSED"],
        },
      },
    }),

    prisma.ticket.count({
      where: {
        workspaceId: workspace.id,
        status: {
          notIn: ["RESOLVED", "CLOSED"],
        },
        assigneeMembershipId: null,
      },
    }),

    prisma.incident.count({
      where: {
        workspaceId: workspace.id,
        status: {
          not: "RESOLVED",
        },
      },
    }),

    prisma.incident.count({
      where: {
        workspaceId: workspace.id,
        priority: "P0",
        status: {
          not: "RESOLVED",
        },
      },
    }),

    prisma.ticket.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        number: true,
        title: true,
        priority: true,
        status: true,
        updatedAt: true,
      },
    }),

    prisma.incident.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        number: true,
        title: true,
        priority: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    workspace,
    membership,

    metrics: {
      openTickets,
      unassignedTickets,
      activeIncidents,
      criticalIncidents,
    },

    recentTickets,
    recentIncidents,
  };
}