import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  workspaceCreate: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/server/database/prisma", () => ({
  prisma: {
    workspace: {
      create: mocks.workspaceCreate,
    },
  },
}));

import { createWorkspace } from "./create-workspace";

describe("createWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.auth.mockResolvedValue({
      isAuthenticated: true,
      userId: "user_123",
    });

    mocks.workspaceCreate.mockResolvedValue({
      slug: "acme-engineering-abc123",
    });
  });

  it("creates the workspace and OWNER membership together", async () => {
    const formData = new FormData();
    formData.set("name", "Acme Engineering");

    await createWorkspace(formData);

    expect(mocks.workspaceCreate).toHaveBeenCalledTimes(1);

    expect(mocks.workspaceCreate).toHaveBeenCalledWith({
      data: {
        name: "Acme Engineering",
        slug: expect.stringMatching(/^acme-engineering-[a-f0-9]{6}$/),
        memberships: {
          create: {
            userId: "user_123",
            role: "OWNER",
          },
        },
      },
      select: {
        slug: true,
      },
    });

    expect(mocks.redirect).toHaveBeenCalledWith(
      "/workspaces/acme-engineering-abc123",
    );
  });

  it("rejects unauthenticated workspace creation", async () => {
    mocks.auth.mockResolvedValue({
      isAuthenticated: false,
      userId: null,
    });

    const formData = new FormData();
    formData.set("name", "Unauthorized Workspace");

    await expect(createWorkspace(formData)).rejects.toThrow(
      "You must be signed in to create a workspace.",
    );

    expect(mocks.workspaceCreate).not.toHaveBeenCalled();
  });

  it("rejects an invalid workspace name", async () => {
    const formData = new FormData();
    formData.set("name", " ");

    await expect(createWorkspace(formData)).rejects.toThrow(
      "Workspace name must be at least 2 characters.",
    );

    expect(mocks.workspaceCreate).not.toHaveBeenCalled();
  });
});
