import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  requireWorkspacePermission: vi.fn(),
  serviceFindFirst: vi.fn(),
  serviceCreate: vi.fn(),
  serviceUpdateMany: vi.fn(),
}));

vi.mock(
  "@/server/authorization/require-workspace-permission",
  () => ({
    requireWorkspacePermission:
      mocks.requireWorkspacePermission,
  }),
);

vi.mock("@/server/database/prisma", () => ({
  prisma: {
    service: {
      findFirst: mocks.serviceFindFirst,
      create: mocks.serviceCreate,
      updateMany: mocks.serviceUpdateMany,
    },
  },
}));

import {
  archiveService,
  createService,
  createServiceSlug,
  ServiceManagementError,
  updateService,
} from "./service-management";

describe("service management", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.requireWorkspacePermission.mockResolvedValue({
      id: "membership_123",
      workspaceId: "workspace_123",
      userId: "user_123",
      role: "OWNER",
    });

    mocks.serviceFindFirst.mockResolvedValue(null);

    mocks.serviceCreate.mockResolvedValue({
      id: "service_123",
      workspaceId: "workspace_123",
      name: "Payments API",
      slug: "payments-api",
      description: "Processes customer payments.",
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mocks.serviceUpdateMany.mockResolvedValue({
      count: 1,
    });
  });

  it("creates URL-safe service slugs", () => {
    expect(createServiceSlug("Payments API")).toBe(
      "payments-api",
    );

    expect(
      createServiceSlug("  Customer Dashboard  "),
    ).toBe("customer-dashboard");
  });

  it("requires service management permission when creating a service", async () => {
    await createService({
      workspaceId: "workspace_123",
      name: "Payments API",
      description: "Processes customer payments.",
    });

    expect(
      mocks.requireWorkspacePermission,
    ).toHaveBeenCalledWith({
      workspaceId: "workspace_123",
      permission: "services:manage",
    });
  });

  it("creates a service inside the requested workspace", async () => {
    await createService({
      workspaceId: "workspace_123",
      name: "Payments API",
      description: "Processes customer payments.",
    });

    expect(mocks.serviceFindFirst).toHaveBeenCalledWith({
      where: {
        workspaceId: "workspace_123",
        slug: "payments-api",
      },
      select: {
        id: true,
      },
    });

    expect(mocks.serviceCreate).toHaveBeenCalledWith({
      data: {
        workspaceId: "workspace_123",
        name: "Payments API",
        slug: "payments-api",
        description: "Processes customer payments.",
      },
      select: expect.any(Object),
    });
  });

  it("rejects duplicate service names inside a workspace", async () => {
    mocks.serviceFindFirst.mockResolvedValue({
      id: "existing_service",
    });

    await expect(
      createService({
        workspaceId: "workspace_123",
        name: "Payments API",
      }),
    ).rejects.toThrow(
      "A service with this name already exists in the workspace.",
    );

    expect(mocks.serviceCreate).not.toHaveBeenCalled();
  });

  it("rejects an update when the service is outside the workspace", async () => {
    mocks.serviceFindFirst.mockResolvedValue(null);

    await expect(
      updateService({
        workspaceId: "workspace_123",
        serviceId: "service_from_another_workspace",
        name: "Authentication",
      }),
    ).rejects.toThrow("Active service not found.");

    expect(
      mocks.serviceUpdateMany,
    ).not.toHaveBeenCalled();
  });

  it("updates an active service using workspace-scoped conditions", async () => {
    mocks.serviceFindFirst
      .mockResolvedValueOnce({
        id: "service_123",
      })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "service_123",
        workspaceId: "workspace_123",
        name: "Authentication API",
        slug: "authentication-api",
        description: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    await updateService({
      workspaceId: "workspace_123",
      serviceId: "service_123",
      name: "Authentication API",
      description: "",
    });

    expect(
      mocks.serviceUpdateMany,
    ).toHaveBeenCalledWith({
      where: {
        id: "service_123",
        workspaceId: "workspace_123",
        archivedAt: null,
      },
      data: {
        name: "Authentication API",
        slug: "authentication-api",
        description: null,
      },
    });
  });

  it("archives a service without deleting it", async () => {
    const result = await archiveService({
      workspaceId: "workspace_123",
      serviceId: "service_123",
    });

    expect(
      mocks.serviceUpdateMany,
    ).toHaveBeenCalledWith({
      where: {
        id: "service_123",
        workspaceId: "workspace_123",
        archivedAt: null,
      },
      data: {
        archivedAt: expect.any(Date),
      },
    });

    expect(result.archivedAt).toBeInstanceOf(Date);
  });

  it("rejects archiving a service that is not active in the workspace", async () => {
    mocks.serviceUpdateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      archiveService({
        workspaceId: "workspace_123",
        serviceId: "missing_service",
      }),
    ).rejects.toThrow(ServiceManagementError);
  });
});
