import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireWorkspacePermission: vi.fn(),
  invitationFindFirst: vi.fn(),
  invitationCreate: vi.fn(),
}));

vi.mock(
  "@/server/authorization/require-workspace-permission",
  () => ({
    requireWorkspacePermission: mocks.requireWorkspacePermission,
  }),
);

vi.mock("@/server/database/prisma", () => ({
  prisma: {
    invitation: {
      findFirst: mocks.invitationFindFirst,
      create: mocks.invitationCreate,
    },
  },
}));

import {
  createInvitation,
  InvitationError,
} from "./create-invitation";

describe("createInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.requireWorkspacePermission.mockResolvedValue({
      id: "membership_owner",
      workspaceId: "workspace_123",
      userId: "user_123",
      role: "OWNER",
    });

    mocks.invitationFindFirst.mockResolvedValue(null);

    mocks.invitationCreate.mockImplementation(async ({ data }) => ({
      id: "invitation_123",
      email: data.email,
      role: data.role,
      expiresAt: data.expiresAt,
    }));
  });

  it("requires workspace invitation permission", async () => {
    await createInvitation({
      workspaceId: "workspace_123",
      email: "person@example.com",
      role: "AGENT",
    });

    expect(mocks.requireWorkspacePermission).toHaveBeenCalledWith({
      workspaceId: "workspace_123",
      permission: "members:invite",
    });
  });

  it("normalizes email and stores only the invitation token hash", async () => {
    const result = await createInvitation({
      workspaceId: "workspace_123",
      email: "  Person@Example.COM  ",
      role: "AGENT",
    });

    expect(result.email).toBe("person@example.com");
    expect(result.token).toEqual(expect.any(String));
    expect(result.token.length).toBeGreaterThan(20);

    const createCall = mocks.invitationCreate.mock.calls[0][0];

    expect(createCall.data.email).toBe("person@example.com");
    expect(createCall.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(createCall.data).not.toHaveProperty("token");

    const expectedHash = createHash("sha256")
      .update(result.token)
      .digest("hex");

    expect(createCall.data.tokenHash).toBe(expectedHash);
  });

  it("rejects another active invitation for the same workspace and email", async () => {
    mocks.invitationFindFirst.mockResolvedValue({
      id: "existing_invitation",
    });

    await expect(
      createInvitation({
        workspaceId: "workspace_123",
        email: "person@example.com",
        role: "VIEWER",
      }),
    ).rejects.toThrow(
      "A pending invitation already exists for this email address.",
    );

    expect(mocks.invitationCreate).not.toHaveBeenCalled();
  });

  it("prevents admins from inviting another admin", async () => {
    mocks.requireWorkspacePermission.mockResolvedValue({
      id: "membership_admin",
      workspaceId: "workspace_123",
      userId: "user_admin",
      role: "ADMIN",
    });

    await expect(
      createInvitation({
        workspaceId: "workspace_123",
        email: "admin@example.com",
        role: "ADMIN",
      }),
    ).rejects.toThrow(InvitationError);

    expect(mocks.invitationCreate).not.toHaveBeenCalled();
  });
});
