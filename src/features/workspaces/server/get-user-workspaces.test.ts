import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  workspaceFindMany: vi.fn(),
}));

vi.mock("@/server/database/prisma", () => ({
  prisma: {
    workspace: {
      findMany: mocks.workspaceFindMany,
    },
  },
}));

import { getUserWorkspaces } from "./get-user-workspaces";

describe("getUserWorkspaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only workspaces with an active membership for the user", async () => {
    mocks.workspaceFindMany.mockResolvedValue([]);

    await getUserWorkspaces("user_123");

    expect(mocks.workspaceFindMany).toHaveBeenCalledWith({
      where: {
        memberships: {
          some: {
            userId: "user_123",
            removedAt: null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        memberships: {
          where: {
            userId: "user_123",
            removedAt: null,
          },
          select: {
            role: true,
          },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  });
});
