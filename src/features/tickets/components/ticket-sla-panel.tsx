"use client";

import { useEffect, useState } from "react";

import {
  getTicketSlaTargetStatus,
  type TicketSlaState,
} from "@/features/tickets/server/ticket-sla";

type TicketSlaPanelProps = {
  createdAt: string;
  responseDeadline: string | null;
  resolutionDeadline: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  evaluatedAt: string;
};

const stateStyles: Record<
  TicketSlaState,
  {
    label: string;
    badge: string;
    bar: string;
  }
> = {
  NOT_CONFIGURED: {
    label: "No target",
    badge:
      "bg-[#eef0f4] text-[#777b87]",
    bar: "bg-[#b4b7c1]",
  },
  ON_TRACK: {
    label: "On track",
    badge:
      "bg-[#e8f8f4] text-[#168c73]",
    bar: "bg-[#35b992]",
  },
  WARNING: {
    label: "Warning",
    badge:
      "bg-[#fff3dd] text-[#d98718]",
    bar: "bg-[#f0a12b]",
  },
  BREACHED: {
    label: "Breached",
    badge:
      "bg-[#ffe8e9] text-[#e94e5a]",
    bar: "bg-[#ef5d67]",
  },
  MET: {
    label: "Met",
    badge:
      "bg-[#e8f8ed] text-[#2f9e62]",
    bar: "bg-[#35b992]",
  },
};

function formatDuration(milliseconds: number) {
  const absolute = Math.abs(milliseconds);
  const totalMinutes = Math.max(
    Math.round(absolute / 60_000),
    1,
  );

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours < 24) {
    return minutes > 0
      ? `${hours}h ${minutes}m`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0
    ? `${days}d ${remainingHours}h`
    : `${days}d`;
}

function formatDeadline(value: string | null) {
  if (!value) {
    return "Not configured";
  }

  return new Date(value).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function getDetailText({
  label,
  state,
  startedAt,
  completedAt,
  deadline,
  remainingMs,
}: {
  label: "Response" | "Resolution";
  state: TicketSlaState;
  startedAt: Date;
  completedAt: Date | null;
  deadline: Date | null;
  remainingMs: number | null;
}) {
  if (
    state === "NOT_CONFIGURED" ||
    !deadline ||
    remainingMs === null
  ) {
    return "No SLA target configured.";
  }

  if (state === "MET" && completedAt) {
    return `${label} completed in ${formatDuration(
      completedAt.getTime() -
        startedAt.getTime(),
    )}.`;
  }

  if (
    state === "BREACHED" &&
    completedAt
  ) {
    return `${label} completed ${formatDuration(
      completedAt.getTime() -
        deadline.getTime(),
    )} late.`;
  }

  if (state === "BREACHED") {
    return `Overdue by ${formatDuration(
      remainingMs,
    )}.`;
  }

  return `${formatDuration(
    remainingMs,
  )} remaining.`;
}

function SlaTarget({
  title,
  description,
  status,
  startedAt,
}: {
  title: "Response" | "Resolution";
  description: string;
  status: ReturnType<
    typeof getTicketSlaTargetStatus
  >;
  startedAt: Date;
}) {
  const styles = stateStyles[status.state];

  return (
    <div className="rounded-2xl border border-[#e7e8ee] bg-[#fafbfc] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#343643]">
            {title}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-[#9a9daa]">
            {description}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles.badge}`}
        >
          {styles.label}
        </span>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#e9eaf0]">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${styles.bar}`}
          style={{
            width: `${status.progressPercent}%`,
          }}
        />
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-xs font-medium text-[#555966]">
          {getDetailText({
            label: title,
            state: status.state,
            startedAt,
            completedAt: status.completedAt,
            deadline: status.deadline,
            remainingMs: status.remainingMs,
          })}
        </p>

        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#b0b3bd]">
            Deadline
          </p>

          <p
            suppressHydrationWarning
            className="mt-1 whitespace-nowrap text-[10px] text-[#858895]"
          >
            {formatDeadline(
              status.deadline?.toISOString() ??
                null,
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TicketSlaPanel({
  createdAt,
  responseDeadline,
  resolutionDeadline,
  firstResponseAt,
  resolvedAt,
  closedAt,
  evaluatedAt,
}: TicketSlaPanelProps) {
  const [now, setNow] = useState(
    () => new Date(evaluatedAt),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const startedAt = new Date(createdAt);

  const responseStatus =
    getTicketSlaTargetStatus({
      startedAt,
      deadline: responseDeadline
        ? new Date(responseDeadline)
        : null,
      completedAt: firstResponseAt
        ? new Date(firstResponseAt)
        : null,
      now,
    });

  const resolutionStatus =
    getTicketSlaTargetStatus({
      startedAt,
      deadline: resolutionDeadline
        ? new Date(resolutionDeadline)
        : null,
      completedAt: resolvedAt
        ? new Date(resolvedAt)
        : closedAt
          ? new Date(closedAt)
          : null,
      now,
    });

  return (
    <section className="overflow-hidden rounded-[22px] border border-[#e4e6ed] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.05)]">
      <div className="border-b border-[#eff0f4] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">
              Service level
            </p>

            <p className="mt-1 text-xs text-[#9a9daa]">
              Live response and resolution targets.
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eeeaff] text-sm font-semibold text-[#6d5dfc]">
            ◷
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <SlaTarget
          title="Response"
          description="Time to first operational response"
          status={responseStatus}
          startedAt={startedAt}
        />

        <SlaTarget
          title="Resolution"
          description="Time to resolve the reported issue"
          status={resolutionStatus}
          startedAt={startedAt}
        />
      </div>
    </section>
  );
}
