import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/server/database/prisma";

export async function getTicketFormData(slug: string) {
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
  });

  if (!workspace) {
    return null;
  }

  const currentMembership = workspace.memberships.find(
    (membership) => membership.userId === userId,
  );

  if (!currentMembership) {
    return null;
  }

  return {
    workspace,
    currentMembership,
  };
}