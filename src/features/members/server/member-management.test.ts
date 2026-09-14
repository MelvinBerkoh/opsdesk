import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireWorkspacePermission: vi.fn(),
  membershipFindFirst: vi.fn(),
  membershipUpdateMany: vi.fn(),
  invitationFindFirst: vi.fn(),
  invitationUpdateMany: vi.fn(),
}));

vi.mock(
  "@/server/authorization/require-workspace-permission",
  () => ({
    requireWorkspacePermission: mocks.requireWorkspacePermission,
  }),
);

vi.mock("@/server/database/prisma", () => ({
  prisma: {
    membership: {
      findFirst: mocks.membershipFindFirst,
      updateMany: mocks.membershipUpdateMany,
    },
    invitation: {
      findFirst: mocks.invitationFindFirst,
      updateMany: mocks.invitationUpdateMany,
    },
  },
}));

import {
  MemberManagementError,
  removeMember,
  revokeInvitation,
  updateMemberRole,
} from "./member-management";

describe("member management", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.requireWorkspacePermission.mockResolvedValue({
      id: "owner_membership",
      workspaceId: "workspace_123",
      userId: "owner_user",
      role: "OWNER",
    });

    mocks.membershipFindFirst.mockResolvedValue({
      id: "target_membership",
      userId: "target_user",
      role: "AGENT",
    });

    mocks.membershipUpdateMany.mockResolvedValue({
      count: 1,
    });

    mocks.invitationFindFirst.mockResolvedValue({
      id: "invitation_123",
      role: "AGENT",
    });

    mocks.invitationUpdateMany.mockResolvedValue({
      count: 1,
    });
  });

  it("requires member management permission before changing a role", async () => {
    await updateMemberRole({
      workspaceId: "workspace_123",
      membershipId: "target_membership",
      role: "VIEWER",
    });

    expect(mocks.requireWorkspacePermission).toHaveBeenCalledWith({
      workspaceId: "workspace_123",
      permission: "members:manage",
    });
  });

  it("allows an owner to promote a member to admin", async () => {
    const result = await updateMemberRole({
      workspaceId: "workspace_123",
      membershipId: "target_membership",
      role: "ADMIN",
    });

    expect(mocks.membershipUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "target_membership",
        workspaceId: "workspace_123",
        removedAt: null,
      },
      data: {
        role: "ADMIN",
      },
    });

    expect(result.role).toBe("ADMIN");
  });

  it("prevents an admin from promoting someone to admin", async () => {
    mocks.requireWorkspacePermission.mockResolvedValue({
      id: "admin_membership",
      workspaceId: "workspace_123",
      userId: "admin_user",
      role: "ADMIN",
    });

    await expect(
      updateMemberRole({
        workspaceId: "workspace_123",
        membershipId: "target_membership",
        role: "ADMIN",
      }),
    ).rejects.toThrow(
      "Only the workspace owner can promote someone to admin.",
    );

    expect(mocks.membershipUpdateMany).not.toHaveBeenCalled();
  });

  it("prevents an admin from modifying another admin", async () => {
    mocks.requireWorkspacePermission.mockResolvedValue({
      id: "admin_membership",
      workspaceId: "workspace_123",
      userId: "admin_user",
      role: "ADMIN",
    });

    mocks.membershipFindFirst.mockResolvedValue({
      id: "target_admin",
      userId: "target_user",
      role: "ADMIN",
    });

    await expect(
      updateMemberRole({
        workspaceId: "workspace_123",
        membershipId: "target_admin",
        role: "AGENT",
      }),
    ).rejects.toThrow("Admins cannot modify other admins.");
  });

  it("protects the owner from normal role changes", async () => {
    mocks.membershipFindFirst.mockResolvedValue({
      id: "owner_membership",
      userId: "owner_user",
      role: "OWNER",
    });

    await expect(
      updateMemberRole({
        workspaceId: "workspace_123",
        membershipId: "owner_membership",
        role: "VIEWER",
      }),
    ).rejects.toThrow(MemberManagementError);

    expect(mocks.membershipUpdateMany).not.toHaveBeenCalled();
  });

  it("removes a normal member by setting removedAt", async () => {
    const result = await removeMember({
      workspaceId: "workspace_123",
      membershipId: "target_membership",
    });

    expect(mocks.membershipUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "target_membership",
        workspaceId: "workspace_123",
        removedAt: null,
      },
      data: {
        removedAt: expect.any(Date),
      },
    });

    expect(result.removedAt).toBeInstanceOf(Date);
  });

  it("prevents the owner from being removed", async () => {
    mocks.membershipFindFirst.mockResolvedValue({
      id: "owner_membership",
      userId: "owner_user",
      role: "OWNER",
    });

    await expect(
      removeMember({
        workspaceId: "workspace_123",
        membershipId: "owner_membership",
      }),
    ).rejects.toThrow();

    expect(mocks.membershipUpdateMany).not.toHaveBeenCalled();
  });

  it("prevents a member from removing themselves", async () => {
    mocks.requireWorkspacePermission.mockResolvedValue({
      id: "admin_membership",
      workspaceId: "workspace_123",
      userId: "admin_user",
      role: "ADMIN",
    });

    mocks.membershipFindFirst.mockResolvedValue({
      id: "admin_membership",
      userId: "admin_user",
      role: "ADMIN",
    });

    await expect(
      removeMember({
        workspaceId: "workspace_123",
        membershipId: "admin_membership",
      }),
    ).rejects.toThrow(
      "You cannot remove yourself from the workspace.",
    );
  });

  it("revokes a pending invitation", async () => {
    const result = await revokeInvitation({
      workspaceId: "workspace_123",
      invitationId: "invitation_123",
    });

    expect(mocks.invitationUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "invitation_123",
        workspaceId: "workspace_123",
        acceptedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date),
      },
    });

    expect(result.revokedAt).toBeInstanceOf(Date);
  });

  it("prevents an admin from revoking an admin invitation", async () => {
    mocks.requireWorkspacePermission.mockResolvedValue({
      id: "admin_membership",
      workspaceId: "workspace_123",
      userId: "admin_user",
      role: "ADMIN",
    });

    mocks.invitationFindFirst.mockResolvedValue({
      id: "invitation_123",
      role: "ADMIN",
    });

    await expect(
      revokeInvitation({
        workspaceId: "workspace_123",
        invitationId: "invitation_123",
      }),
    ).rejects.toThrow(
      "Only the workspace owner can revoke an admin invitation.",
    );

    expect(mocks.invitationUpdateMany).not.toHaveBeenCalled();
  });
});
