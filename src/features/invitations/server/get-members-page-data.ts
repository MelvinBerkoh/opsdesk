import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/server/database/prisma";

export async function getMembersPageData(slug: string) {
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
        select: {
          id: true,
          userId: true,
          role: true,
          joinedAt: true,
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      invitations: {
        where: {
          acceptedAt: null,
          revokedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
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
