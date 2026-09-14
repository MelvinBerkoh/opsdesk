import { z } from "zod";

import { requireWorkspacePermission } from "@/server/authorization/require-workspace-permission";
import { prisma } from "@/server/database/prisma";

const memberRoleSchema = z.enum(["ADMIN", "AGENT", "VIEWER"]);

const memberActionSchema = z.object({
  workspaceId: z.string().min(1),
  membershipId: z.string().min(1),
});

const updateMemberRoleSchema = memberActionSchema.extend({
  role: memberRoleSchema,
});

const revokeInvitationSchema = z.object({
  workspaceId: z.string().min(1),
  invitationId: z.string().min(1),
});

export class MemberManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemberManagementError";
  }
}

export async function updateMemberRole(input: unknown) {
  const { workspaceId, membershipId, role } =
    updateMemberRoleSchema.parse(input);

  const actor = await requireWorkspacePermission({
    workspaceId,
    permission: "members:manage",
  });

  const target = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      workspaceId,
      removedAt: null,
    },
    select: {
      id: true,
      userId: true,
      role: true,
    },
  });

  if (!target) {
    throw new MemberManagementError("Member not found.");
  }

  if (target.id === actor.id) {
    throw new MemberManagementError("You cannot change your own role.");
  }

  if (target.role === "OWNER") {
    throw new MemberManagementError(
      "The workspace owner cannot be modified here.",
    );
  }

  if (actor.role === "ADMIN" && target.role === "ADMIN") {
    throw new MemberManagementError(
      "Admins cannot modify other admins.",
    );
  }

  if (actor.role === "ADMIN" && role === "ADMIN") {
    throw new MemberManagementError(
      "Only the workspace owner can promote someone to admin.",
    );
  }

  const result = await prisma.membership.updateMany({
    where: {
      id: target.id,
      workspaceId,
      removedAt: null,
    },
    data: {
      role,
    },
  });

  if (result.count !== 1) {
    throw new MemberManagementError(
      "This member is no longer active.",
    );
  }

  return {
    membershipId: target.id,
    role,
  };
}

export async function removeMember(input: unknown) {
  const { workspaceId, membershipId } = memberActionSchema.parse(input);

  const actor = await requireWorkspacePermission({
    workspaceId,
    permission: "members:manage",
  });

  const target = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      workspaceId,
      removedAt: null,
    },
    select: {
      id: true,
      userId: true,
      role: true,
    },
  });

  if (!target) {
    throw new MemberManagementError("Member not found.");
  }

  if (target.id === actor.id) {
    throw new MemberManagementError(
      "You cannot remove yourself from the workspace.",
    );
  }

  if (target.role === "OWNER") {
    throw new MemberManagementError(
      "The workspace owner cannot be removed.",
    );
  }

  if (actor.role === "ADMIN" && target.role === "ADMIN") {
    throw new MemberManagementError(
      "Admins cannot remove other admins.",
    );
  }

  const removedAt = new Date();

  const result = await prisma.membership.updateMany({
    where: {
      id: target.id,
      workspaceId,
      removedAt: null,
    },
    data: {
      removedAt,
    },
  });

  if (result.count !== 1) {
    throw new MemberManagementError(
      "This member is no longer active.",
    );
  }

  return {
    membershipId: target.id,
    removedAt,
  };
}

export async function revokeInvitation(input: unknown) {
  const { workspaceId, invitationId } =
    revokeInvitationSchema.parse(input);

  const actor = await requireWorkspacePermission({
    workspaceId,
    permission: "members:invite",
  });

  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      workspaceId,
      acceptedAt: null,
      revokedAt: null,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!invitation) {
    throw new MemberManagementError(
      "Pending invitation not found.",
    );
  }

  if (actor.role === "ADMIN" && invitation.role === "ADMIN") {
    throw new MemberManagementError(
      "Only the workspace owner can revoke an admin invitation.",
    );
  }

  const revokedAt = new Date();

  const result = await prisma.invitation.updateMany({
    where: {
      id: invitation.id,
      workspaceId,
      acceptedAt: null,
      revokedAt: null,
    },
    data: {
      revokedAt,
    },
  });

  if (result.count !== 1) {
    throw new MemberManagementError(
      "This invitation is no longer available.",
    );
  }

  return {
    invitationId: invitation.id,
    revokedAt,
  };
}
