import Link from "next/link";
import { notFound } from "next/navigation";

import { getIncidentsPageData } from "@/features/incidents/server/get-incidents-page-data";
import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav";

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

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-sm text-zinc-500">
            OpsDesk Workspace
          </p>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              {workspace.name}
            </h1>

            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
              {membership.role}
            </span>
          </div>
        </div>
      </header>

      <WorkspaceNav workspaceSlug={workspace.slug} />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Incident response
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Incidents
          </h2>

          <p className="mt-3 text-zinc-400">
            Track outages and high-impact issues that require
            coordinated response.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">
              Total incidents
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {workspace.incidents.length}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">
              Active incidents
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {activeCount}
            </p>
          </div>

          <div className="rounded-xl border border-red-900 bg-red-950/20 p-5">
            <p className="text-sm text-red-400">
              Critical active
            </p>

            <p className="mt-2 text-2xl font-semibold text-red-300">
              {criticalCount}
            </p>
          </div>
        </div>

        <section className="mt-10">
          {workspace.incidents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center">
              <p className="font-medium text-zinc-300">
                No incidents yet
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Escalate a ticket when an issue requires
                coordinated incident response.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {workspace.incidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/workspaces/${workspace.slug}/incidents/${incident.number}`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/80"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-zinc-500">
                          {formatIncidentNumber(
                            incident.number,
                          )}
                        </span>

                        <span className="rounded-full border border-red-900 bg-red-950/30 px-2 py-0.5 text-xs text-red-300">
                          {incident.priority} ·{" "}
                          {
                            priorityLabels[
                              incident.priority
                            ]
                          }
                        </span>

                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                          {statusLabels[incident.status]}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold">
                        {incident.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                        <span>
                          Service:{" "}
                          {incident.service?.name ?? "None"}
                        </span>

                        <span>
                          Owner:{" "}
                          {incident.owner?.userId ??
                            "Unassigned"}
                        </span>

                        {incident.sourceTicket && (
                          <span>
                            Source:{" "}
                            {formatTicketNumber(
                              incident.sourceTicket.number,
                            )}
                          </span>
                        )}

                        <span>
                          Updated{" "}
                          {incident.updatedAt.toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}