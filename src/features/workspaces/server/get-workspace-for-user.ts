import { prisma } from "@/server/database/prisma";

type GetWorkspaceForUserInput = {
  slug: string;
  userId: string;
};

export async function getWorkspaceForUser({
  slug,
  userId,
}: GetWorkspaceForUserInput) {
  return prisma.workspace.findFirst({
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
      createdAt: true,
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
}
