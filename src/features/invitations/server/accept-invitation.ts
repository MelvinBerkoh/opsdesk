import { createHash } from "node:crypto";

import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@/server/database/prisma";

const acceptInvitationSchema = z.object({
  token: z.string().min(20, "Invalid invitation token."),
});

export class AcceptInvitationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcceptInvitationError";
  }
}

export async function acceptInvitation(input: unknown) {
  const { token } = acceptInvitationSchema.parse(input);

  const { userId } = await auth.protect();
  const user = await currentUser();

  if (!user) {
    throw new AcceptInvitationError("You must be signed in.");
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const invitation = await prisma.invitation.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      workspaceId: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
      workspace: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new AcceptInvitationError("This invitation is invalid.");
  }

  if (invitation.revokedAt) {
    throw new AcceptInvitationError("This invitation has been revoked.");
  }

  if (invitation.acceptedAt) {
    throw new AcceptInvitationError("This invitation has already been used.");
  }

  const now = new Date();

  if (invitation.expiresAt <= now) {
    throw new AcceptInvitationError("This invitation has expired.");
  }

  const invitationEmail = invitation.email.toLowerCase();

  const hasVerifiedInvitationEmail = user.emailAddresses.some(
    (address) =>
      address.emailAddress.toLowerCase() === invitationEmail &&
      address.verification?.status === "verified",
  );

  if (!hasVerifiedInvitationEmail) {
    throw new AcceptInvitationError(
      "This invitation was sent to a different email address.",
    );
  }

  const membership = await prisma.$transaction(async (tx) => {
    const existingMembership = await tx.membership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId,
        },
      },
      select: {
        id: true,
        removedAt: true,
      },
    });

    if (existingMembership && !existingMembership.removedAt) {
      throw new AcceptInvitationError(
        "You are already a member of this workspace.",
      );
    }

    const claimedInvitation = await tx.invitation.updateMany({
      where: {
        id: invitation.id,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        acceptedAt: now,
      },
    });

    if (claimedInvitation.count !== 1) {
      throw new AcceptInvitationError(
        "This invitation is no longer available.",
      );
    }

    if (existingMembership) {
      return tx.membership.update({
        where: {
          id: existingMembership.id,
        },
        data: {
          role: invitation.role,
          removedAt: null,
          joinedAt: now,
        },
        select: {
          id: true,
          workspaceId: true,
          role: true,
        },
      });
    }

    return tx.membership.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role,
      },
      select: {
        id: true,
        workspaceId: true,
        role: true,
      },
    });
  });

  return {
    membership,
    workspace: invitation.workspace,
  };
}
