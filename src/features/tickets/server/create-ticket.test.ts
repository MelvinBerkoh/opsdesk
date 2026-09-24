import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  requireWorkspacePermission: vi.fn(),
  transaction: vi.fn(),
  serviceFindFirst: vi.fn(),
  membershipFindFirst: vi.fn(),
  workspaceUpdate: vi.fn(),
  ticketCreate: vi.fn(),
  ticketActivityCreate: vi.fn(),
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
    $transaction: mocks.transaction,
  },
}));

import {
  createTicket,
  TicketManagementError,
} from "./create-ticket";

describe("createTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.requireWorkspacePermission.mockResolvedValue({
      id: "reporter_membership",
      workspaceId: "workspace_123",
      userId: "user_123",
      role: "AGENT",
    });

    mocks.serviceFindFirst.mockResolvedValue({
      id: "service_123",
    });

    mocks.membershipFindFirst.mockResolvedValue({
      id: "assignee_membership",
    });

    mocks.workspaceUpdate.mockResolvedValue({
      ticketSequence: 42,
    });

    mocks.ticketCreate.mockResolvedValue({
      id: "ticket_123",
      workspaceId: "workspace_123",
      number: 42,
      title: "Checkout is failing",
      description: "Customers cannot complete checkout.",
      priority: "P1",
      status: "OPEN",
      serviceId: "service_123",
      reporterMembershipId: "reporter_membership",
      assigneeMembershipId: "assignee_membership",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mocks.ticketActivityCreate.mockResolvedValue({
      id: "activity_123",
    });

    mocks.transaction.mockImplementation(async (callback) =>
      callback({
        service: {
          findFirst: mocks.serviceFindFirst,
        },
        membership: {
          findFirst: mocks.membershipFindFirst,
        },
        workspace: {
          update: mocks.workspaceUpdate,
        },
        ticket: {
          create: mocks.ticketCreate,
        },
        ticketActivity: {
          create: mocks.ticketActivityCreate,
        },
      }),
    );
  });

  it("requires ticket management permission", async () => {
    await createTicket({
      workspaceId: "workspace_123",
      title: "Checkout is failing",
      description: "Customers cannot complete checkout.",
      priority: "P1",
      serviceId: "service_123",
      assigneeMembershipId: "assignee_membership",
    });

    expect(
      mocks.requireWorkspacePermission,
    ).toHaveBeenCalledWith({
      workspaceId: "workspace_123",
      permission: "tickets:manage",
    });
  });

  it("validates the selected service belongs to the workspace", async () => {
    await createTicket({
      workspaceId: "workspace_123",
      title: "Checkout is failing",
      description: "Customers cannot complete checkout.",
      serviceId: "service_123",
    });

    expect(mocks.serviceFindFirst).toHaveBeenCalledWith({
      where: {
        id: "service_123",
        workspaceId: "workspace_123",
        archivedAt: null,
      },
      select: {
        id: true,
      },
    });
  });

  it("rejects a service outside the workspace", async () => {
    mocks.serviceFindFirst.mockResolvedValue(null);

    await expect(
      createTicket({
        workspaceId: "workspace_123",
        title: "Checkout is failing",
        description: "Customers cannot complete checkout.",
        serviceId: "outside_service",
      }),
    ).rejects.toThrow(
      "Selected service is not available in this workspace.",
    );

    expect(mocks.workspaceUpdate).not.toHaveBeenCalled();
    expect(mocks.ticketCreate).not.toHaveBeenCalled();
  });

  it("rejects an inactive or cross-workspace assignee", async () => {
    mocks.membershipFindFirst.mockResolvedValue(null);

    await expect(
      createTicket({
        workspaceId: "workspace_123",
        title: "Checkout is failing",
        description: "Customers cannot complete checkout.",
        assigneeMembershipId: "invalid_membership",
      }),
    ).rejects.toThrow(
      "Selected assignee is not an active member of this workspace.",
    );

    expect(mocks.ticketCreate).not.toHaveBeenCalled();
  });

  it("atomically increments the workspace ticket sequence", async () => {
    await createTicket({
      workspaceId: "workspace_123",
      title: "Checkout is failing",
      description: "Customers cannot complete checkout.",
      priority: "P1",
    });

    expect(mocks.workspaceUpdate).toHaveBeenCalledWith({
      where: {
        id: "workspace_123",
      },
      data: {
        ticketSequence: {
          increment: 1,
        },
      },
      select: {
        ticketSequence: true,
      },
    });
  });

  it("uses the new sequence value as the ticket number", async () => {
    await createTicket({
      workspaceId: "workspace_123",
      title: "Checkout is failing",
      description: "Customers cannot complete checkout.",
      priority: "P1",
      serviceId: "service_123",
      assigneeMembershipId: "assignee_membership",
    });

    expect(mocks.ticketCreate).toHaveBeenCalledWith({
      data: {
        workspaceId: "workspace_123",
        number: 42,
        title: "Checkout is failing",
        description: "Customers cannot complete checkout.",
        priority: "P1",
        status: "OPEN",
        serviceId: "service_123",
        reporterMembershipId: "reporter_membership",
        assigneeMembershipId: "assignee_membership",
      },
      select: expect.any(Object),
    });
  });

  it("creates the initial ticket activity in the same transaction", async () => {
    await createTicket({
      workspaceId: "workspace_123",
      title: "Checkout is failing",
      description: "Customers cannot complete checkout.",
      priority: "P1",
    });

    expect(
      mocks.ticketActivityCreate,
    ).toHaveBeenCalledWith({
      data: {
        workspaceId: "workspace_123",
        ticketId: "ticket_123",
        actorMembershipId: "reporter_membership",
        type: "CREATED",
        metadata: {
          status: "OPEN",
          priority: "P1",
        },
      },
    });
  });

  it("defaults ticket priority to P2", async () => {
    await createTicket({
      workspaceId: "workspace_123",
      title: "Minor issue",
      description: "Something needs investigation.",
    });

    expect(mocks.ticketCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          priority: "P2",
        }),
      }),
    );
  });

  it("allows tickets without a service or assignee", async () => {
    await createTicket({
      workspaceId: "workspace_123",
      title: "General support issue",
      description: "Needs investigation.",
    });

    expect(mocks.ticketCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          serviceId: null,
          assigneeMembershipId: null,
        }),
      }),
    );

    expect(mocks.serviceFindFirst).not.toHaveBeenCalled();
    expect(mocks.membershipFindFirst).not.toHaveBeenCalled();
  });

  it("uses the expected error type for invalid relationships", async () => {
    mocks.serviceFindFirst.mockResolvedValue(null);

    await expect(
      createTicket({
        workspaceId: "workspace_123",
        title: "Broken payments",
        description: "Payments are failing.",
        serviceId: "invalid_service",
      }),
    ).rejects.toThrow(TicketManagementError);
  });
});