import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authProtect: vi.fn(),
  membershipFindFirst: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: {
    protect: mocks.authProtect,
  },
}));

vi.mock("@/server/database/prisma", () => ({
  prisma: {
    membership: {
      findFirst: mocks.membershipFindFirst,
    },
  },
}));

import { requireWorkspacePermission } from "./require-workspace-permission";
import { WorkspaceAuthorizationError } from "./workspace-permissions";

describe("requireWorkspacePermission", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.authProtect.mockResolvedValue({
      userId: "user_123",
    });
  });

  it("loads only an active membership for the authenticated user", async () => {
    mocks.membershipFindFirst.mockResolvedValue({
      id: "membership_123",
      workspaceId: "workspace_123",
      userId: "user_123",
      role: "OWNER",
    });

    await requireWorkspacePermission({
      workspaceId: "workspace_123",
      permission: "workspace:view",
    });

    expect(mocks.membershipFindFirst).toHaveBeenCalledWith({
      where: {
        workspaceId: "workspace_123",
        userId: "user_123",
        removedAt: null,
      },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        role: true,
      },
    });
  });

  it("returns the membership when the user has permission", async () => {
    mocks.membershipFindFirst.mockResolvedValue({
      id: "membership_123",
      workspaceId: "workspace_123",
      userId: "user_123",
      role: "ADMIN",
    });

    const membership = await requireWorkspacePermission({
      workspaceId: "workspace_123",
      permission: "members:invite",
    });

    expect(membership).toEqual({
      id: "membership_123",
      workspaceId: "workspace_123",
      userId: "user_123",
      role: "ADMIN",
    });
  });

  it("rejects a user without an active workspace membership", async () => {
    mocks.membershipFindFirst.mockResolvedValue(null);

    await expect(
      requireWorkspacePermission({
        workspaceId: "workspace_123",
        permission: "workspace:view",
      }),
    ).rejects.toThrow(WorkspaceAuthorizationError);
  });

  it("rejects a member whose role does not have the required permission", async () => {
    mocks.membershipFindFirst.mockResolvedValue({
      id: "membership_123",
      workspaceId: "workspace_123",
      userId: "user_123",
      role: "AGENT",
    });

    await expect(
      requireWorkspacePermission({
        workspaceId: "workspace_123",
        permission: "members:manage",
      }),
    ).rejects.toThrow(WorkspaceAuthorizationError);
  });
});
