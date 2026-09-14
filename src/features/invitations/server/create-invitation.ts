import { createHash, randomBytes } from "node:crypto";

import { z } from "zod";

import { prisma } from "@/server/database/prisma";
import { requireWorkspacePermission } from "@/server/authorization/require-workspace-permission";

const invitationSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["ADMIN", "AGENT", "VIEWER"]),
});

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export class InvitationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvitationError";
  }
}

export async function createInvitation(input: unknown) {
  const { workspaceId, email, role } = invitationSchema.parse(input);

  const inviter = await requireWorkspacePermission({
    workspaceId,
    permission: "members:invite",
  });

  if (inviter.role === "ADMIN" && role === "ADMIN") {
    throw new InvitationError("Only workspace owners can invite admins.");
  }

  const now = new Date();

  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      workspaceId,
      email,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingInvitation) {
    throw new InvitationError(
      "A pending invitation already exists for this email address.",
    );
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(now.getTime() + INVITATION_LIFETIME_MS);

  const invitation = await prisma.invitation.create({
    data: {
      workspaceId,
      email,
      role,
      tokenHash,
      invitedByMembershipId: inviter.id,
      expiresAt,
    },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
    },
  });

  return {
    ...invitation,
    token,
  };
}
