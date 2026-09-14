import { createHash } from "node:crypto";

import { prisma } from "@/server/database/prisma";

/**
 * What this does: Safely looks up an invitation from the token in the URL.
 *
 * Why: We never query the database using the raw token because only its SHA-256 hash is stored. 
 * This function also tells the UI whether the invite is valid, expired, revoked, or already used.
 */
export type InvitationPreviewStatus =
  | "VALID"
  | "EXPIRED"
  | "REVOKED"
  | "ACCEPTED";

export async function getInvitationPreview(token: string) {
  if (token.length < 20) {
    return null;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const invitation = await prisma.invitation.findUnique({
    where: {
      tokenHash,
    },
    select: {
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
    return null;
  }

  let status: InvitationPreviewStatus = "VALID";

  if (invitation.revokedAt) {
    status = "REVOKED";
  } else if (invitation.acceptedAt) {
    status = "ACCEPTED";
  } else if (invitation.expiresAt <= new Date()) {
    status = "EXPIRED";
  }

  return {
    ...invitation,
    status,
  };
}