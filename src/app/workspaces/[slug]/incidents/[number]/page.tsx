import Link from "next/link";
import { notFound } from "next/navigation";

import { IncidentDetailsForm } from "@/features/incidents/components/incident-details-form";
import { getIncidentDetail } from "@/features/incidents/server/get-incident-detail";
import { WorkspaceShell } from "@/features/workspaces/components/workspace-shell";
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
    const priority = getStringValue(
      record,
      "priority",
    );

    const status = getStringValue(
      record,
      "status",
    );

    if (priority && status) {
      return `${priority} · ${formatStatus(status)}`;
    }
  }

  return null;
}

function getStatusStyle(
  status:
    | "OPEN"
    | "INVESTIGATING"
    | "MONITORING"
    | "RESOLVED",
) {
  switch (status) {
    case "OPEN":
      return "bg-[#fff0f1] text-[#df5661]";
    case "INVESTIGATING":
      return "bg-[#fff1dd] text-[#d98b22]";
    case "MONITORING":
      return "bg-[#eeeaff] text-[#6757e8]";
    case "RESOLVED":
      return "bg-[#e7f8ef] text-[#279565]";
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

  const active =
    incident.status !== "RESOLVED";

  return (
    <WorkspaceShell
      workspaceName={incident.workspace.name}
      workspaceSlug={incident.workspace.slug}
      role={currentMembership.role}
    >
      <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-9 lg:py-10">
        <Link
          href={`/workspaces/${incident.workspace.slug}/incidents`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#898c98] transition hover:text-[#ef5d67]"
        >
          ← Back to incidents
        </Link>

        <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-semibold text-[#e3545f]">
                {formatIncidentNumber(incident.number)}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                  incident.status,
                )}`}
              >
                {statusLabels[incident.status]}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                  incident.priority,
                )}`}
              >
                {incident.priority} ·{" "}
                {priorityLabels[incident.priority]}
              </span>

              {active && (
                <span className="flex items-center gap-2 rounded-full bg-[#17182b] px-3 py-1 text-xs font-medium text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ef5d67] shadow-[0_0_8px_rgba(239,93,103,0.55)]" />
                  Live response
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#171927] lg:text-[40px]">
              {incident.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#999ca7]">
              <span>
                Started{" "}
                {incident.createdAt.toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </span>

              {incident.sourceTicket && (
                <>
                  <span className="h-1 w-1 rounded-full bg-[#c7c9d0]" />

                  <Link
                    href={`/workspaces/${incident.workspace.slug}/tickets/${incident.sourceTicket.number}`}
                    className="font-medium text-[#6d5dfc] transition hover:text-[#5445d9]"
                  >
                    Escalated from{" "}
                    {formatTicketNumber(
                      incident.sourceTicket.number,
                    )}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_330px]">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[24px] bg-[#17182b] p-6 text-white shadow-xl shadow-[#17182b]/10 sm:p-8">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#ef5d67]/12 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ff8e96]">
                      Response context
                    </p>

                    <h2 className="mt-3 text-xl font-semibold">
                      Incident summary
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-xs text-white/45">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        active
                          ? "bg-[#ef5d67]"
                          : "bg-[#52cca2]"
                      }`}
                    />

                    {active
                      ? "Response active"
                      : "Resolved"}
                  </div>
                </div>

                <p className="mt-7 whitespace-pre-wrap text-[15px] leading-7 text-white/60">
                  {incident.description}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.045] p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
                      Service
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {incident.service?.name ??
                        "No service"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.045] p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
                      Owner
                    </p>

                    <p className="mt-2 truncate text-sm font-medium">
                      {incident.owner?.userId ??
                        "Unassigned"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.045] p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
                      Source
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {incident.sourceTicket
                        ? formatTicketNumber(
                            incident.sourceTicket.number,
                          )
                        : "Manual"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-[#e4e6ed] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.045)]">
              <div className="flex items-center justify-between border-b border-[#eff0f4] px-6 py-5 sm:px-8">
                <div>
                  <h2 className="font-semibold">
                    Response timeline
                  </h2>

                  <p className="mt-1 text-xs text-[#9a9daa]">
                    Operational history for this incident
                  </p>
                </div>

                <span className="rounded-full bg-[#fff0f1] px-3 py-1.5 text-xs font-medium text-[#df5661]">
                  {incident.activities.length} events
                </span>
              </div>

              <div className="px-6 py-3 sm:px-8">
                {incident.activities.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[#9a9daa]">
                    No incident activity yet.
                  </div>
                ) : (
                  incident.activities.map(
                    (activity, index) => {
                      const detail = getActivityDetail(
                        activity.type,
                        activity.metadata,
                        incident.workspace.services,
                        incident.workspace.memberships,
                      );

                      return (
                        <div
                          key={activity.id}
                          className="relative flex gap-4 py-5"
                        >
                          {index !==
                            incident.activities.length -
                              1 && (
                            <div className="absolute left-[15px] top-10 h-[calc(100%-18px)] w-px bg-[#e7e8ee]" />
                          )}

                          <div
                            className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white text-[10px] font-bold shadow-sm ${
                              activity.type ===
                                "RESOLVED" ||
                              activity.type ===
                                "REOPENED"
                                ? "bg-[#e7f8ef] text-[#279565]"
                                : activity.type ===
                                    "CREATED"
                                  ? "bg-[#fff0f1] text-[#df5661]"
                                  : "bg-[#eeeaff] text-[#6d5dfc]"
                            }`}
                          >
                            {activity.type ===
                            "TICKET_LINKED"
                              ? "↗"
                              : activity.type ===
                                  "CREATED"
                                ? "!"
                                : "•"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                              <div>
                                <p className="text-sm font-semibold text-[#393b49]">
                                  {
                                    activityLabels[
                                      activity.type
                                    ]
                                  }
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
                    },
                  )
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
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

            {incident.sourceTicket && (
              <Link
                href={`/workspaces/${incident.workspace.slug}/tickets/${incident.sourceTicket.number}`}
                className="group block rounded-[22px] border border-[#e4e6ed] bg-white p-5 transition hover:border-[#d8d3ff] hover:shadow-[0_10px_30px_rgba(37,39,64,0.05)]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9a9daa]">
                  Source ticket
                </p>

                <p className="mt-3 text-sm font-semibold text-[#6d5dfc]">
                  {formatTicketNumber(
                    incident.sourceTicket.number,
                  )}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#666a77]">
                  {incident.sourceTicket.title}
                </p>

                <span className="mt-4 inline-block text-xs font-semibold text-[#6d5dfc] transition group-hover:translate-x-1">
                  View ticket →
                </span>
              </Link>
            )}

            {incident.resolvedAt && (
              <div className="rounded-[22px] border border-[#cfeadd] bg-[#effaf5] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2e9c6b]">
                  ✓
                </div>

                <p className="mt-4 text-sm font-semibold text-[#277b59]">
                  Incident resolved
                </p>

                <p className="mt-1 text-xs text-[#68a18a]">
                  {incident.resolvedAt.toLocaleString()}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}