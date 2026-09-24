import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/server/database/prisma";

export async function getIncidentsPageData(slug: string) {
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
          userId: true,
          role: true,
        },
        take: 1,
      },

      incidents: {
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          number: true,
          title: true,
          priority: true,
          status: true,
          createdAt: true,
          updatedAt: true,

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
            },
          },
        },
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

  return {
    workspace,
    membership,
  };
}
