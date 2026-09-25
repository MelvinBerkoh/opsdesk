import Link from "next/link";
import { notFound } from "next/navigation";

import { EscalateTicketButton } from "@/features/incidents/components/escalate-ticket-button";
import { TicketDetailsForm } from "@/features/tickets/components/ticket-details-form";
import { TicketSlaPanel } from "@/features/tickets/components/ticket-sla-panel";
import { getTicketDetail } from "@/features/tickets/server/get-ticket-detail";
import { WorkspaceShell } from "@/features/workspaces/components/workspace-shell";
import { hasWorkspacePermission } from "@/server/authorization/workspace-permissions";

type TicketDetailPageProps = {
  params: Promise<{
    slug: string;
    number: string;
  }>;
};

const priorityLabels = {
  P0: "Critical",
  P1: "High",
  P2: "Medium",
  P3: "Low",
} as const;

const statusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING: "Waiting",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
} as const;

const activityLabels = {
  CREATED: "Ticket created",
  STATUS_CHANGED: "Status changed",
  PRIORITY_CHANGED: "Priority changed",
  ASSIGNEE_CHANGED: "Assignee changed",
  SERVICE_CHANGED: "Service changed",
  COMMENT_ADDED: "Comment added",
  SLA_WARNING: "SLA warning",
  SLA_BREACHED: "SLA breached",
  RESOLVED: "Ticket resolved",
  CLOSED: "Ticket closed",
  REOPENED: "Ticket reopened",
  INCIDENT_LINKED: "Incident linked",
} as const;

function formatTicketNumber(number: number) {
  return `TKT-${String(number).padStart(4, "0")}`;
}

function getMetadataValues(metadata: unknown) {
  if (
    !metadata ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    return { from: null, to: null };
  }

  const record = metadata as Record<string, unknown>;

  return {
    from:
      typeof record.from === "string" ? record.from : null,
    to: typeof record.to === "string" ? record.to : null,
  };
}

function formatStatus(value: string | null) {
  if (!value) {
    return "None";
  }

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getActivityDetail(
  type: keyof typeof activityLabels,
  metadata: unknown,
  services: Array<{
    id: string;
    name: string;
  }>,
  members: Array<{
    id: string;
    userId: string;
  }>,
) {
  const { from, to } = getMetadataValues(metadata);

  if (
    type === "STATUS_CHANGED" ||
    type === "RESOLVED" ||
    type === "CLOSED" ||
    type === "REOPENED"
  ) {
    return `${formatStatus(from)} → ${formatStatus(to)}`;
  }

  if (type === "PRIORITY_CHANGED") {
    return `${from ?? "None"} → ${to ?? "None"}`;
  }

  if (type === "SERVICE_CHANGED") {
    const oldService =
      services.find((service) => service.id === from)?.name ??
      (from ? "Unknown service" : "None");

    const newService =
      services.find((service) => service.id === to)?.name ??
      (to ? "Unknown service" : "None");

    return `${oldService} → ${newService}`;
  }

  if (type === "ASSIGNEE_CHANGED") {
    const oldAssignee =
      members.find((member) => member.id === from)?.userId ??
      (from ? "Unknown member" : "Unassigned");

    const newAssignee =
      members.find((member) => member.id === to)?.userId ??
      (to ? "Unknown member" : "Unassigned");

    return `${oldAssignee} → ${newAssignee}`;
  }

  if (
    type === "SLA_WARNING" ||
    type === "SLA_BREACHED"
  ) {
    const record =
      metadata &&
      typeof metadata === "object" &&
      !Array.isArray(metadata)
        ? (metadata as Record<string, unknown>)
        : null;

    const target =
      record?.target === "RESOLUTION"
        ? "Resolution"
        : "First response";

    return type === "SLA_WARNING"
      ? `${target} target is approaching its deadline.`
      : `${target} target missed its deadline.`;
  }

  return null;
}

function getStatusStyle(
  status:
    | "OPEN"
    | "IN_PROGRESS"
    | "WAITING"
    | "RESOLVED"
    | "CLOSED",
) {
  switch (status) {
    case "OPEN":
      return "bg-[#edf0ff] text-[#5e63d8]";
    case "IN_PROGRESS":
      return "bg-[#e6f8f4] text-[#168c73]";
    case "WAITING":
      return "bg-[#fff3dd] text-[#dc8b1f]";
    case "RESOLVED":
      return "bg-[#e6f8ed] text-[#2f9e62]";
    case "CLOSED":
      return "bg-[#eef0f4] text-[#777b87]";
  }
}

function getPriorityStyle(
  priority: "P0" | "P1" | "P2" | "P3",
) {
  switch (priority) {
    case "P0":
      return "bg-[#ffe8e9] text-[#e94e5a]";
    case "P1":
      return "bg-[#fff1dd] text-[#e89722]";
    case "P2":
      return "bg-[#eeeaff] text-[#6d5dfc]";
    case "P3":
      return "bg-[#eef0f4] text-[#777b87]";
  }
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { slug, number } = await params;

  const ticketNumber = Number(number);

  if (!Number.isInteger(ticketNumber) || ticketNumber < 1) {
    notFound();
  }

  const data = await getTicketDetail(slug, ticketNumber);

  if (!data) {
    notFound();
  }

  const { ticket, currentMembership } = data;

  const canManageTickets = hasWorkspacePermission(
    currentMembership.role,
    "tickets:manage",
  );

  const canManageIncidents = hasWorkspacePermission(
    currentMembership.role,
    "incidents:manage",
  );

  return (
    <WorkspaceShell
      workspaceName={ticket.workspace.name}
      workspaceSlug={ticket.workspace.slug}
      role={currentMembership.role}
    >
      <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-9 lg:py-10">
        <Link
          href={`/workspaces/${ticket.workspace.slug}/tickets`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#898c98] transition hover:text-[#6d5dfc]"
        >
          ← Back to tickets
        </Link>

        <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-semibold text-[#6d5dfc]">
                {formatTicketNumber(ticket.number)}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                  ticket.status,
                )}`}
              >
                {statusLabels[ticket.status]}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                  ticket.priority,
                )}`}
              >
                {ticket.priority} ·{" "}
                {priorityLabels[ticket.priority]}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#171927] lg:text-[40px]">
              {ticket.title}
            </h1>

            <p className="mt-3 text-sm text-[#989ba6]">
              Reported{" "}
              {ticket.createdAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_330px]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-[#e4e6ed] bg-white p-6 shadow-[0_10px_35px_rgba(37,39,64,0.045)] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6d5dfc]">
                  ◫
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Issue description
                  </h2>

                  <p className="mt-0.5 text-xs text-[#a0a3ae]">
                    Original reported context
                  </p>
                </div>
              </div>

              <p className="mt-6 whitespace-pre-wrap text-[15px] leading-7 text-[#555966]">
                {ticket.description}
              </p>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-[#e4e6ed] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.045)]">
              <div className="flex items-center justify-between border-b border-[#eff0f4] px-6 py-5 sm:px-8">
                <div>
                  <h2 className="font-semibold">
                    Activity timeline
                  </h2>

                  <p className="mt-1 text-xs text-[#9a9daa]">
                    Every recorded change to this ticket
                  </p>
                </div>

                <span className="rounded-full bg-[#f3f4f8] px-3 py-1.5 text-xs font-medium text-[#858895]">
                  {ticket.activities.length} events
                </span>
              </div>

              <div className="px-6 py-3 sm:px-8">
                {ticket.activities.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[#9a9daa]">
                    No activity recorded yet.
                  </div>
                ) : (
                  ticket.activities.map((activity, index) => {
                    const detail = getActivityDetail(
                      activity.type,
                      activity.metadata,
                      ticket.workspace.services,
                      ticket.workspace.memberships,
                    );

                    return (
                      <div
                        key={activity.id}
                        className="relative flex gap-4 py-5"
                      >
                        {index !==
                          ticket.activities.length - 1 && (
                          <div className="absolute left-[15px] top-10 h-[calc(100%-18px)] w-px bg-[#e7e8ee]" />
                        )}

                        <div className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#eeeaff] text-[10px] font-bold text-[#6d5dfc] shadow-sm">
                          {activity.type === "INCIDENT_LINKED"
                            ? "⚡"
                            : activity.type === "CREATED"
                              ? "+"
                              : "•"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                            <div>
                              <p className="text-sm font-semibold text-[#393b49]">
                                {activityLabels[activity.type]}
                              </p>

                              {detail && (
                                <p className="mt-1 text-sm text-[#747784]">
                                  {detail}
                                </p>
                              )}

                              <p className="mt-2 text-xs text-[#aaaeba]">
                                {activity.actor?.userId ??
                                  "System"}
                              </p>
                            </div>

                            <time className="shrink-0 text-xs text-[#b0b3bc]">
                              {activity.createdAt.toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </time>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <TicketSlaPanel
              createdAt={ticket.createdAt.toISOString()}
              responseDeadline={
                ticket.responseDeadline?.toISOString() ?? null
              }
              resolutionDeadline={
                ticket.resolutionDeadline?.toISOString() ?? null
              }
              firstResponseAt={
                ticket.firstResponseAt?.toISOString() ?? null
              }
              resolvedAt={
                ticket.resolvedAt?.toISOString() ?? null
              }
              closedAt={
                ticket.closedAt?.toISOString() ?? null
              }
              evaluatedAt={new Date().toISOString()}
            />

            {canManageTickets && (
              <TicketDetailsForm
                workspaceId={ticket.workspace.id}
                workspaceSlug={ticket.workspace.slug}
                ticketId={ticket.id}
                ticketNumber={ticket.number}
                status={ticket.status}
                priority={ticket.priority}
                serviceId={ticket.service?.id ?? null}
                assigneeMembershipId={
                  ticket.assignee?.id ?? null
                }
                services={ticket.workspace.services}
                members={ticket.workspace.memberships}
              />
            )}

            <div className="rounded-[22px] border border-[#e4e6ed] bg-white p-5">
              <p className="text-sm font-semibold">
                Ticket context
              </p>

              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a0a3ae]">
                    Service
                  </dt>

                  <dd className="mt-1.5 text-sm font-medium text-[#555966]">
                    {ticket.service?.name ?? "No service"}
                  </dd>
                </div>

                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a0a3ae]">
                    Assignee
                  </dt>

                  <dd className="mt-1.5 break-all text-sm font-medium text-[#555966]">
                    {ticket.assignee?.userId ?? "Unassigned"}
                  </dd>
                </div>

                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a0a3ae]">
                    Reporter
                  </dt>

                  <dd className="mt-1.5 break-all text-sm font-medium text-[#555966]">
                    {ticket.reporter.userId}
                  </dd>
                </div>

                {ticket.resolvedAt && (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a0a3ae]">
                      Resolved
                    </dt>

                    <dd className="mt-1.5 text-sm font-medium text-[#555966]">
                      {ticket.resolvedAt.toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {canManageIncidents && (
              <EscalateTicketButton
                workspaceId={ticket.workspace.id}
                workspaceSlug={ticket.workspace.slug}
                ticketId={ticket.id}
                ticketNumber={ticket.number}
              />
            )}
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}
