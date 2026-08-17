import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  workspaceFindFirst: vi.fn(),
}));

vi.mock("@/server/database/prisma", () => ({
  prisma: {
    workspace: {
      findFirst: mocks.workspaceFindFirst,
    },
  },
}));

import { getWorkspaceForUser } from "./get-workspace-for-user";

describe("getWorkspaceForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scopes workspace access to an active membership", async () => {
    mocks.workspaceFindFirst.mockResolvedValue(null);

    await getWorkspaceForUser({
      slug: "acme",
      userId: "user_123",
    });

    expect(mocks.workspaceFindFirst).toHaveBeenCalledWith({
      where: {
        slug: "acme",
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
        createdAt: true,
        memberships: {
          where: {
            userId: "user_123",
            removedAt: null,
          },
          select: {
            id: true,
            role: true,
          },
          take: 1,
        },
      },
    });
  });
});
