import Link from "next/link";
import { notFound } from "next/navigation";

import { getIncidentsPageData } from "@/features/incidents/server/get-incidents-page-data";
import { WorkspaceShell } from "@/features/workspaces/components/workspace-shell";

type IncidentsPageProps = {
  params: Promise<{
    slug: string;
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

function formatIncidentNumber(number: number) {
  return `INC-${String(number).padStart(4, "0")}`;
}

function formatTicketNumber(number: number) {
  return `TKT-${String(number).padStart(4, "0")}`;
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

export default async function IncidentsPage({
  params,
}: IncidentsPageProps) {
  const { slug } = await params;

  const data = await getIncidentsPageData(slug);

  if (!data) {
    notFound();
  }

  const { workspace, membership } = data;

  const activeCount = workspace.incidents.filter(
    (incident) => incident.status !== "RESOLVED",
  ).length;

  const criticalCount = workspace.incidents.filter(
    (incident) =>
      incident.priority === "P0" &&
      incident.status !== "RESOLVED",
  ).length;

  const investigatingCount = workspace.incidents.filter(
    (incident) =>
      incident.status === "INVESTIGATING",
  ).length;

  const resolvedCount = workspace.incidents.filter(
    (incident) => incident.status === "RESOLVED",
  ).length;

  return (
    <WorkspaceShell
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      role={membership.role}
    >
      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-9 lg:py-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ef5d67] shadow-[0_0_10px_rgba(239,93,103,0.45)]" />

              <p className="text-sm font-semibold text-[#e3545f]">
                Incident response
              </p>
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171927] lg:text-[38px]">
              Incidents
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8d909d]">
              Coordinate high-impact issues, ownership, and
              response state from one place.
            </p>
          </div>

          <div className="rounded-xl border border-[#ecdfe0] bg-[#fffafa] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#b58c90]">
              Response state
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  criticalCount > 0
                    ? "bg-[#ef5d67]"
                    : "bg-[#38b789]"
                }`}
              />

              <span
                className={`text-sm font-semibold ${
                  criticalCount > 0
                    ? "text-[#dc4e59]"
                    : "text-[#258b68]"
                }`}
              >
                {criticalCount > 0
                  ? "Attention required"
                  : "No critical incidents"}
              </span>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0f1] text-[#e65761]">
                ⚡
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#afb2bd]">
                Active
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {activeCount}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Active incidents
            </p>
          </div>

          <div className="rounded-2xl border border-[#efdddd] bg-gradient-to-br from-white to-[#fff8f8] p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe8e9] text-[#ef5d67]">
                !
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#ef5d67]">
                P0
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {criticalCount}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Critical
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1dd] text-[#e89b27]">
                ↻
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#afb2bd]">
                Live
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {investigatingCount}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Investigating
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f8ef] text-[#2d9a68]">
                ✓
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#afb2bd]">
                Done
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {resolvedCount}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Resolved
            </p>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[24px] border border-[#e4e6ed] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.045)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[#eff0f4] px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold">
                Response queue
              </h2>

              <p className="mt-1 text-xs text-[#9da0ac]">
                {workspace.incidents.length} incidents recorded
              </p>
            </div>

            <div className="flex gap-2">
              <span className="rounded-lg bg-[#17182b] px-3 py-2 text-xs font-medium text-white">
                All
              </span>

              <span className="rounded-lg bg-[#f4f5f8] px-3 py-2 text-xs font-medium text-[#7d808d]">
                Active
              </span>

              <span className="rounded-lg bg-[#f4f5f8] px-3 py-2 text-xs font-medium text-[#7d808d]">
                Resolved
              </span>
            </div>
          </div>

          {workspace.incidents.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0f1] text-xl text-[#ef5d67]">
                ⚡
              </div>

              <p className="mt-4 font-medium">
                No incidents
              </p>

              <p className="mt-1 text-sm text-[#9da0ac]">
                Escalated tickets will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[110px_1fr_145px_130px_150px_120px] border-b border-[#eff0f4] bg-[#fafbfc] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a1a4af] md:grid">
                <span>Incident</span>
                <span>Issue</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Service</span>
                <span>Source</span>
              </div>

              <div className="divide-y divide-[#eff0f4]">
                {workspace.incidents.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/workspaces/${workspace.slug}/incidents/${incident.number}`}
                    className="group grid gap-4 px-6 py-5 transition hover:bg-[#fffafa] md:grid-cols-[110px_1fr_145px_130px_150px_120px] md:items-center"
                  >
                    <span className="text-xs font-semibold text-[#e3545f]">
                      {formatIncidentNumber(
                        incident.number,
                      )}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#252735]">
                        {incident.title}
                      </p>

                      <p className="mt-1 text-xs text-[#a0a3ae] md:hidden">
                        {incident.service?.name ??
                          "No service"}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          incident.status,
                        )}`}
                      >
                        {statusLabels[incident.status]}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                          incident.priority,
                        )}`}
                      >
                        {incident.priority} ·{" "}
                        {
                          priorityLabels[
                            incident.priority
                          ]
                        }
                      </span>
                    </div>

                    <span className="hidden truncate text-sm text-[#777b87] md:block">
                      {incident.service?.name ?? "—"}
                    </span>

                    <span className="hidden text-xs font-medium text-[#777b87] md:block">
                      {incident.sourceTicket
                        ? formatTicketNumber(
                            incident.sourceTicket.number,
                          )
                        : "—"}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}