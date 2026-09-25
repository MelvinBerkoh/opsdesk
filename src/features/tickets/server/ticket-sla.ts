export const TICKET_SLA_POLICIES = {
  P0: {
    responseMinutes: 15,
    resolutionMinutes: 4 * 60,
  },
  P1: {
    responseMinutes: 60,
    resolutionMinutes: 8 * 60,
  },
  P2: {
    responseMinutes: 4 * 60,
    resolutionMinutes: 24 * 60,
  },
  P3: {
    responseMinutes: 8 * 60,
    resolutionMinutes: 72 * 60,
  },
} as const;

export type TicketSlaPriority =
  keyof typeof TICKET_SLA_POLICIES;

export type TicketSlaState =
  | "NOT_CONFIGURED"
  | "ON_TRACK"
  | "WARNING"
  | "BREACHED"
  | "MET";

type CalculateTicketSlaDeadlinesInput = {
  priority: TicketSlaPriority;
  startedAt: Date;
};

type TicketSlaTargetStatusInput = {
  startedAt: Date;
  deadline: Date | null;
  completedAt: Date | null;
  now: Date;
};

export type TicketSlaTargetStatus = {
  state: TicketSlaState;
  deadline: Date | null;
  warningThreshold: Date | null;
  completedAt: Date | null;
  remainingMs: number | null;
  elapsedMs: number | null;
  targetDurationMs: number | null;
  progressPercent: number;
};

function addMinutes(date: Date, minutes: number) {
  return new Date(
    date.getTime() + minutes * 60 * 1000,
  );
}

export function calculateTicketSlaDeadlines({
  priority,
  startedAt,
}: CalculateTicketSlaDeadlinesInput) {
  const policy = TICKET_SLA_POLICIES[priority];

  return {
    responseDeadline: addMinutes(
      startedAt,
      policy.responseMinutes,
    ),
    resolutionDeadline: addMinutes(
      startedAt,
      policy.resolutionMinutes,
    ),
  };
}

export function getTicketSlaTargetStatus({
  startedAt,
  deadline,
  completedAt,
  now,
}: TicketSlaTargetStatusInput): TicketSlaTargetStatus {
  if (!deadline) {
    return {
      state: "NOT_CONFIGURED",
      deadline: null,
      warningThreshold: null,
      completedAt,
      remainingMs: null,
      elapsedMs: null,
      targetDurationMs: null,
      progressPercent: 0,
    };
  }

  const startedAtMs = startedAt.getTime();
  const deadlineMs = deadline.getTime();
  const nowMs = now.getTime();
  const completedAtMs = completedAt?.getTime() ?? null;

  const targetDurationMs = Math.max(
    deadlineMs - startedAtMs,
    1,
  );

  const warningThreshold = new Date(
    startedAtMs + targetDurationMs * 0.75,
  );

  const comparisonMs = completedAtMs ?? nowMs;
  const elapsedMs = Math.max(
    comparisonMs - startedAtMs,
    0,
  );

  const progressPercent = Math.min(
    Math.max(
      Math.round(
        (elapsedMs / targetDurationMs) * 100,
      ),
      0,
    ),
    100,
  );

  let state: TicketSlaState;

  if (completedAtMs !== null) {
    state =
      completedAtMs <= deadlineMs
        ? "MET"
        : "BREACHED";
  } else if (nowMs > deadlineMs) {
    state = "BREACHED";
  } else if (
    nowMs >= warningThreshold.getTime()
  ) {
    state = "WARNING";
  } else {
    state = "ON_TRACK";
  }

  return {
    state,
    deadline,
    warningThreshold,
    completedAt,
    remainingMs:
      completedAtMs === null
        ? deadlineMs - nowMs
        : deadlineMs - completedAtMs,
    elapsedMs,
    targetDurationMs,
    progressPercent,
  };
}
