import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/server/database/prisma";

export async function getServicesPageData(slug: string) {
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
      services: {
        orderBy: [
          {
            archivedAt: "asc",
          },
          {
            name: "asc",
          },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          archivedAt: true,
          createdAt: true,
          updatedAt: true,
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