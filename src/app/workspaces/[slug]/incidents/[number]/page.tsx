import Link from "next/link";
import { notFound } from "next/navigation";

import { IncidentDetailsForm } from "@/features/incidents/components/incident-details-form";
import { getIncidentDetail } from "@/features/incidents/server/get-incident-detail";
import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav";
import { hasWorkspacePermission } from "@/server/authorization/workspace-permissions";

type IncidentDetailPageProps = {
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
  INVESTIGATING: "Investigating",
  MONITORING: "Monitoring",
  RESOLVED: "Resolved",
} as const;

const activityLabels = {
  CREATED: "Incident created",
  STATUS_CHANGED: "Status changed",
  PRIORITY_CHANGED: "Priority changed",
  OWNER_CHANGED: "Owner changed",
  SERVICE_CHANGED: "Service changed",
  TICKET_LINKED: "Ticket linked",
  RESOLVED: "Incident resolved",
  REOPENED: "Incident reopened",
} as const;

function formatIncidentNumber(number: number) {
  return `INC-${String(number).padStart(4, "0")}`;
}

function formatTicketNumber(number: number) {
  return `TKT-${String(number).padStart(4, "0")}`;
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

function getMetadataRecord(metadata: unknown) {
  if (
    !metadata ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    return null;
  }

  return metadata as Record<string, unknown>;
}

function getStringValue(
  record: Record<string, unknown> | null,
  key: string,
) {
  const value = record?.[key];

  return typeof value === "string" ? value : null;
}

function getNumberValue(
  record: Record<string, unknown> | null,
  key: string,
) {
  const value = record?.[key];

  return typeof value === "number" ? value : null;
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
  const record = getMetadataRecord(metadata);

  const from = getStringValue(record, "from");
  const to = getStringValue(record, "to");

  if (
    type === "STATUS_CHANGED" ||
    type === "RESOLVED" ||
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

  if (type === "OWNER_CHANGED") {
    const oldOwner =
      members.find((member) => member.id === from)?.userId ??
      (from ? "Unknown member" : "Unassigned");

    const newOwner =
      members.find((member) => member.id === to)?.userId ??
      (to ? "Unknown member" : "Unassigned");

    return `${oldOwner} → ${newOwner}`;
  }

  if (type === "TICKET_LINKED") {
    const ticketNumber = getNumberValue(
      record,
      "ticketNumber",
    );

    return ticketNumber
      ? formatTicketNumber(ticketNumber)
      : "Source ticket linked";
  }

  if (type === "CREATED") {
    const priority = getStringValue(record, "priority");
    const status = getStringValue(record, "status");

    if (priority && status) {
      return `${priority} · ${formatStatus(status)}`;
    }
  }

  return null;
}

export default async function IncidentDetailPage({
  params,
}: IncidentDetailPageProps) {
  const { slug, number } = await params;

  const incidentNumber = Number(number);

  if (
    !Number.isInteger(incidentNumber) ||
    incidentNumber < 1
  ) {
    notFound();
  }

  const data = await getIncidentDetail(
    slug,
    incidentNumber,
  );

  if (!data) {
    notFound();
  }

  const { incident, currentMembership } = data;

  const canManage = hasWorkspacePermission(
    currentMembership.role,
    "incidents:manage",
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
              {incident.workspace.name}
            </h1>

            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
              {currentMembership.role}
            </span>
          </div>
        </div>
      </header>

      <WorkspaceNav
        workspaceSlug={incident.workspace.slug}
      />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href={`/workspaces/${incident.workspace.slug}/incidents`}
          className="text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to incidents
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-zinc-500">
                {formatIncidentNumber(incident.number)}
              </span>

              <span className="rounded-full border border-red-900 bg-red-950/30 px-2.5 py-1 text-xs text-red-300">
                {incident.priority} ·{" "}
                {priorityLabels[incident.priority]}
              </span>

              <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
                {statusLabels[incident.status]}
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              {incident.title}
            </h2>

            {incident.sourceTicket && (
              <Link
                href={`/workspaces/${incident.workspace.slug}/tickets/${incident.sourceTicket.number}`}
                className="mt-4 inline-block text-sm text-zinc-400 transition hover:text-zinc-200"
              >
                Escalated from{" "}
                {formatTicketNumber(
                  incident.sourceTicket.number,
                )}{" "}
                · {incident.sourceTicket.title}
              </Link>
            )}

            <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                Description
              </h3>

              <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-300">
                {incident.description}
              </p>
            </section>

            <section className="mt-8">
              <h3 className="text-lg font-semibold">
                Incident timeline
              </h3>

              <div className="mt-4 space-y-3">
                {incident.activities.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
                    No activity yet.
                  </div>
                ) : (
                  incident.activities.map((activity) => {
                    const detail = getActivityDetail(
                      activity.type,
                      activity.metadata,
                      incident.workspace.services,
                      incident.workspace.memberships,
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
              <IncidentDetailsForm
                workspaceId={incident.workspace.id}
                workspaceSlug={incident.workspace.slug}
                incidentId={incident.id}
                incidentNumber={incident.number}
                status={incident.status}
                priority={incident.priority}
                serviceId={incident.service?.id ?? null}
                ownerMembershipId={
                  incident.owner?.id ?? null
                }
                services={incident.workspace.services}
                members={incident.workspace.memberships}
              />
            )}

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-semibold">
                Incident details
              </h3>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-zinc-500">
                    Status
                  </dt>

                  <dd className="mt-1 text-zinc-200">
                    {statusLabels[incident.status]}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Priority
                  </dt>

                  <dd className="mt-1 text-zinc-200">
                    {incident.priority} ·{" "}
                    {priorityLabels[incident.priority]}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Service
                  </dt>

                  <dd className="mt-1 text-zinc-200">
                    {incident.service?.name ?? "None"}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Owner
                  </dt>

                  <dd className="mt-1 break-all text-zinc-200">
                    {incident.owner?.userId ??
                      "Unassigned"}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Source ticket
                  </dt>

                  <dd className="mt-1 text-zinc-200">
                    {incident.sourceTicket
                      ? formatTicketNumber(
                          incident.sourceTicket.number,
                        )
                      : "None"}
                  </dd>
                </div>

                <div>
                  <dt className="text-zinc-500">
                    Created
                  </dt>

                  <dd className="mt-1 text-zinc-200">
                    {incident.createdAt.toLocaleString()}
                  </dd>
                </div>

                {incident.resolvedAt && (
                  <div>
                    <dt className="text-zinc-500">
                      Resolved
                    </dt>

                    <dd className="mt-1 text-zinc-200">
                      {incident.resolvedAt.toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}