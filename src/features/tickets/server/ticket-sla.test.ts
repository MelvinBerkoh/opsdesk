import { describe, expect, it } from "vitest";

import {
  calculateTicketSlaDeadlines,
  getTicketSlaTargetStatus,
  TICKET_SLA_POLICIES,
} from "@/features/tickets/server/ticket-sla";

describe("ticket SLA policy", () => {
  it("defines progressively longer targets by priority", () => {
    expect(TICKET_SLA_POLICIES.P0).toEqual({
      responseMinutes: 15,
      resolutionMinutes: 240,
    });

    expect(TICKET_SLA_POLICIES.P1).toEqual({
      responseMinutes: 60,
      resolutionMinutes: 480,
    });

    expect(TICKET_SLA_POLICIES.P2).toEqual({
      responseMinutes: 240,
      resolutionMinutes: 1440,
    });

    expect(TICKET_SLA_POLICIES.P3).toEqual({
      responseMinutes: 480,
      resolutionMinutes: 4320,
    });
  });

  it("calculates P0 deadlines", () => {
    const startedAt = new Date(
      "2026-09-24T12:00:00.000Z",
    );

    const deadlines = calculateTicketSlaDeadlines({
      priority: "P0",
      startedAt,
    });

    expect(
      deadlines.responseDeadline.toISOString(),
    ).toBe("2026-09-24T12:15:00.000Z");

    expect(
      deadlines.resolutionDeadline.toISOString(),
    ).toBe("2026-09-24T16:00:00.000Z");
  });
});

describe("ticket SLA status", () => {
  const startedAt = new Date(
    "2026-09-24T12:00:00.000Z",
  );

  const deadline = new Date(
    "2026-09-24T16:00:00.000Z",
  );

  it("is on track before the warning window", () => {
    const result = getTicketSlaTargetStatus({
      startedAt,
      deadline,
      completedAt: null,
      now: new Date(
        "2026-09-24T13:00:00.000Z",
      ),
    });

    expect(result.state).toBe("ON_TRACK");
    expect(result.progressPercent).toBe(25);
  });

  it("enters warning when 75 percent of the target is consumed", () => {
    const result = getTicketSlaTargetStatus({
      startedAt,
      deadline,
      completedAt: null,
      now: new Date(
        "2026-09-24T15:15:00.000Z",
      ),
    });

    expect(result.state).toBe("WARNING");
  });

  it("is breached after the deadline", () => {
    const result = getTicketSlaTargetStatus({
      startedAt,
      deadline,
      completedAt: null,
      now: new Date(
        "2026-09-24T16:01:00.000Z",
      ),
    });

    expect(result.state).toBe("BREACHED");
  });

  it("is met when completed before the deadline", () => {
    const result = getTicketSlaTargetStatus({
      startedAt,
      deadline,
      completedAt: new Date(
        "2026-09-24T14:30:00.000Z",
      ),
      now: new Date(
        "2026-09-24T17:00:00.000Z",
      ),
    });

    expect(result.state).toBe("MET");
  });

  it("stays breached when completed after the deadline", () => {
    const result = getTicketSlaTargetStatus({
      startedAt,
      deadline,
      completedAt: new Date(
        "2026-09-24T16:30:00.000Z",
      ),
      now: new Date(
        "2026-09-24T17:00:00.000Z",
      ),
    });

    expect(result.state).toBe("BREACHED");
    expect(result.remainingMs).toBeLessThan(0);
  });

  it("returns not configured without a deadline", () => {
    const result = getTicketSlaTargetStatus({
      startedAt,
      deadline: null,
      completedAt: null,
      now: new Date(
        "2026-09-24T13:00:00.000Z",
      ),
    });

    expect(result.state).toBe(
      "NOT_CONFIGURED",
    );
  });
});
