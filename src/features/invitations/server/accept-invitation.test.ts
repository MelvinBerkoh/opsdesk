import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authProtect: vi.fn(),
  currentUser: vi.fn(),
  invitationFindUnique: vi.fn(),
  transaction: vi.fn(),
  membershipFindUnique: vi.fn(),
  invitationUpdateMany: vi.fn(),
  membershipCreate: vi.fn(),
  membershipUpdate: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: {
    protect: mocks.authProtect,
  },
  currentUser: mocks.currentUser,
}));

vi.mock("@/server/database/prisma", () => ({
  prisma: {
    invitation: {
      findUnique: mocks.invitationFindUnique,
    },
    $transaction: mocks.transaction,
  },
}));

import {
  acceptInvitation,
  AcceptInvitationError,
} from "./accept-invitation";

describe("acceptInvitation", () => {
  const token = "very-secure-invitation-token-for-testing";

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.authProtect.mockResolvedValue({
      userId: "user_456",
    });

    mocks.currentUser.mockResolvedValue({
      emailAddresses: [
        {
          emailAddress: "person@example.com",
          verification: {
            status: "verified",
          },
        },
      ],
    });

    mocks.invitationFindUnique.mockResolvedValue({
      id: "invitation_123",
      workspaceId: "workspace_123",
      email: "person@example.com",
      role: "AGENT",
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
      workspace: {
        name: "Acme Engineering",
        slug: "acme-engineering",
      },
    });

    mocks.membershipFindUnique.mockResolvedValue(null);
    mocks.invitationUpdateMany.mockResolvedValue({
      count: 1,
    });

    mocks.membershipCreate.mockResolvedValue({
      id: "membership_456",
      workspaceId: "workspace_123",
      role: "AGENT",
    });

    mocks.membershipUpdate.mockResolvedValue({
      id: "membership_456",
      workspaceId: "workspace_123",
      role: "AGENT",
    });

    mocks.transaction.mockImplementation(async (callback) =>
      callback({
        membership: {
          findUnique: mocks.membershipFindUnique,
          create: mocks.membershipCreate,
          update: mocks.membershipUpdate,
        },
        invitation: {
          updateMany: mocks.invitationUpdateMany,
        },
      }),
    );
  });

  it("looks up the invitation using the token hash", async () => {
    await acceptInvitation({ token });

    expect(mocks.invitationFindUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash("sha256").update(token).digest("hex"),
      },
      select: expect.any(Object),
    });
  });

  it("creates membership for the invited user", async () => {
    const result = await acceptInvitation({ token });

    expect(mocks.membershipCreate).toHaveBeenCalledWith({
      data: {
        workspaceId: "workspace_123",
        userId: "user_456",
        role: "AGENT",
      },
      select: {
        id: true,
        workspaceId: true,
        role: true,
      },
    });

    expect(result.workspace.slug).toBe("acme-engineering");
  });

  it("rejects a user without the invited verified email", async () => {
    mocks.currentUser.mockResolvedValue({
      emailAddresses: [
        {
          emailAddress: "different@example.com",
          verification: {
            status: "verified",
          },
        },
      ],
    });

    await expect(
      acceptInvitation({ token }),
    ).rejects.toThrow(
      "This invitation was sent to a different email address.",
    );

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects an expired invitation", async () => {
    mocks.invitationFindUnique.mockResolvedValue({
      id: "invitation_123",
      workspaceId: "workspace_123",
      email: "person@example.com",
      role: "AGENT",
      expiresAt: new Date(Date.now() - 60_000),
      acceptedAt: null,
      revokedAt: null,
      workspace: {
        name: "Acme Engineering",
        slug: "acme-engineering",
      },
    });

    await expect(
      acceptInvitation({ token }),
    ).rejects.toThrow("This invitation has expired.");

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects a revoked invitation", async () => {
    mocks.invitationFindUnique.mockResolvedValue({
      id: "invitation_123",
      workspaceId: "workspace_123",
      email: "person@example.com",
      role: "AGENT",
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: new Date(),
      workspace: {
        name: "Acme Engineering",
        slug: "acme-engineering",
      },
    });

    await expect(
      acceptInvitation({ token }),
    ).rejects.toThrow("This invitation has been revoked.");

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects an already accepted invitation", async () => {
    mocks.invitationFindUnique.mockResolvedValue({
      id: "invitation_123",
      workspaceId: "workspace_123",
      email: "person@example.com",
      role: "AGENT",
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: new Date(),
      revokedAt: null,
      workspace: {
        name: "Acme Engineering",
        slug: "acme-engineering",
      },
    });

    await expect(
      acceptInvitation({ token }),
    ).rejects.toThrow("This invitation has already been used.");

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects an already-active workspace member", async () => {
    mocks.membershipFindUnique.mockResolvedValue({
      id: "membership_existing",
      removedAt: null,
    });

    await expect(
      acceptInvitation({ token }),
    ).rejects.toThrow(
      "You are already a member of this workspace.",
    );

    expect(mocks.membershipCreate).not.toHaveBeenCalled();
  });

  it("reactivates a previously removed member", async () => {
    mocks.membershipFindUnique.mockResolvedValue({
      id: "membership_existing",
      removedAt: new Date(),
    });

    await acceptInvitation({ token });

    expect(mocks.membershipUpdate).toHaveBeenCalledWith({
      where: {
        id: "membership_existing",
      },
      data: {
        role: "AGENT",
        removedAt: null,
        joinedAt: expect.any(Date),
      },
      select: {
        id: true,
        workspaceId: true,
        role: true,
      },
    });

    expect(mocks.membershipCreate).not.toHaveBeenCalled();
  });

  it("prevents the same invitation from being claimed twice", async () => {
    mocks.invitationUpdateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      acceptInvitation({ token }),
    ).rejects.toThrow(
      "This invitation is no longer available.",
    );

    expect(mocks.membershipCreate).not.toHaveBeenCalled();
  });

  it("throws the expected error type for an invalid token", async () => {
    mocks.invitationFindUnique.mockResolvedValue(null);

    await expect(
      acceptInvitation({ token }),
    ).rejects.toThrow(AcceptInvitationError);
  });
});
