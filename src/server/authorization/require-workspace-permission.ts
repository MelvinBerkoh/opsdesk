import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/server/database/prisma";

import {
  assertWorkspacePermission,
  type WorkspacePermission,
  WorkspaceAuthorizationError,
} from "./workspace-permissions";

type RequireWorkspacePermissionInput = {
  workspaceId: string;
  permission: WorkspacePermission;
};

export async function requireWorkspacePermission({
  workspaceId,
  permission,
}: RequireWorkspacePermissionInput) {
  const { userId } = await auth.protect();

  const membership = await prisma.membership.findFirst({
    where: {
      workspaceId,
      userId,
      removedAt: null,
    },
    select: {
      id: true,
      workspaceId: true,
      userId: true,
      role: true,
    },
  });

  if (!membership) {
    throw new WorkspaceAuthorizationError();
  }

  assertWorkspacePermission(membership.role, permission);

  return membership;
}
