import Link from "next/link";
import { notFound } from "next/navigation";

import { TicketDetailsForm } from "@/features/tickets/components/ticket-details-form";
import { getTicketDetail } from "@/features/tickets/server/get-ticket-detail";
import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav";
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
    return {
      from: null,
      to: null,
    };
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

  return null;
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

  const canManage = hasWorkspacePermission(
    currentMembership.role,
    "tickets:manage",
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-sm text-zinc-500">
            OpsDesk Workspace
          </p>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              {ticket.workspace.name}
            </h1>

            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
              {currentMembership.role}
            </span>
          </div>
        </div>
      </header>

      <WorkspaceNav workspaceSlug={ticket.workspace.slug} />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href={`/workspaces/${ticket.workspace.slug}/tickets`}
          className="text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to tickets
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-zinc-500">
                {formatTicketNumber(ticket.number)}
              </span>

              <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
                {ticket.priority} ·{" "}
                {priorityLabels[ticket.priority]}
              </span>

              <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
                {statusLabels[ticket.status]}
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              {ticket.title}
            </h2>

            <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                Description
              </h3>

              <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-300">
                {ticket.description}
              </p>
            </section>

            <section className="mt-8">
              <h3 className="text-lg font-semibold">
                Activity
              </h3>

              <div className="mt-4 space-y-3">
                {ticket.activities.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
                    No activity yet.
                  </div>
                ) : (
                  ticket.activities.map((activity) => {
                    const detail = getActivityDetail(
                      activity.type,
                      activity.metadata,
                      ticket.workspace.services,
                      ticket.workspace.memberships,
                    );

                    return (
                      <div
                        key={activity.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <p className="text-sm font-medium">
                              {
                                activityLabels[
                                  activity.type
                                ]
                              }
                            </p>

                            {detail && (
                              <p className="mt-1 text-sm text-zinc-400">
                                {detail}
                              </p>
                            )}

                            <p className="mt-2 text-xs text-zinc-600">
                              {activity.actor?.userId ??
                                "System"}
                            </p>
                          </div>

                          <time className="shrink-0 text-xs text-zinc-600">
                            {activity.createdAt.toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )}
                          </time>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            {canManage && (
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

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-semibold">
                Ticket details
              </h3>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-zinc-500">
                    Status
                  </dt>

                  <dd className="mt-1 text-zinc-200">
                    {statusLabels[ticket.status]}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Priority
                  </dt>

                  <dd className="mt-1 text-zinc-200">
                    {ticket.priority} ·{" "}
                    {priorityLabels[ticket.priority]}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Service
                  </dt>

                  <dd className="mt-1 text-zinc-200">
                    {ticket.service?.name ?? "None"}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Assignee
                  </dt>

                  <dd className="mt-1 break-all text-zinc-200">
                    {ticket.assignee?.userId ??
                      "Unassigned"}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Reporter
                  </dt>

                  <dd className="mt-1 break-all text-zinc-200">
                    {ticket.reporter.userId}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Created
                  </dt>

                  <dd className="mt-1 text-zinc-200">
                    {ticket.createdAt.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}