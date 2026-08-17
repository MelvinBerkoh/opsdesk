import { prisma } from "@/server/database/prisma";

export async function getUserWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
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
          role: true,
        },
        take: 1,
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}
