import Link from "next/link";
import { notFound } from "next/navigation";

import { WorkspaceShell } from "@/features/workspaces/components/workspace-shell";
import { getWorkspaceDashboardData } from "@/features/workspaces/server/get-workspace-dashboard-data";

type WorkspacePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const ticketStatusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING: "Waiting",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
} as const;

const incidentStatusLabels = {
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  MONITORING: "Monitoring",
  RESOLVED: "Resolved",
} as const;

function formatTicketNumber(number: number) {
  return `TKT-${String(number).padStart(4, "0")}`;
}

function formatIncidentNumber(number: number) {
  return `INC-${String(number).padStart(4, "0")}`;
}

function MetricIcon({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${className}`}
    >
      {children}
    </div>
  );
}

export default async function WorkspacePage({
  params,
}: WorkspacePageProps) {
  const { slug } = await params;

  const data = await getWorkspaceDashboardData(slug);

  if (!data) {
    notFound();
  }

  const {
    workspace,
    membership,
    metrics,
    recentTickets,
    recentIncidents,
  } = data;

  const workloadTotal =
    metrics.openTickets + metrics.activeIncidents;

  const ticketLoad =
    workloadTotal > 0
      ? Math.round(
          (metrics.openTickets / workloadTotal) * 100,
        )
      : 0;

  const incidentLoad =
    workloadTotal > 0
      ? Math.round(
          (metrics.activeIncidents / workloadTotal) * 100,
        )
      : 0;

  const assignmentRate =
    metrics.openTickets > 0
      ? Math.round(
          ((metrics.openTickets -
            metrics.unassignedTickets) /
            metrics.openTickets) *
            100,
        )
      : 100;

  return (
    <WorkspaceShell
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      role={membership.role}
    >
      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-9 lg:py-10">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-medium text-[#6d5dfc]">
              Operations overview
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171927] lg:text-[38px]">
              Good afternoon.
            </h1>

            <p className="mt-2 text-sm text-[#8d909d]">
              Here&apos;s what&apos;s happening across{" "}
              {workspace.name}.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/workspaces/${workspace.slug}/tickets/new`}
              className="rounded-xl border border-[#e1e3ea] bg-white px-4 py-2.5 text-sm font-medium text-[#555968] shadow-sm transition hover:border-[#cacdd7]"
            >
              + New ticket
            </Link>

            <Link
              href={`/workspaces/${workspace.slug}/incidents`}
              className="rounded-xl bg-[#17182b] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#17182b]/15 transition hover:bg-[#24253b]"
            >
              View incidents
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href={`/workspaces/${workspace.slug}/tickets`}
            className="group rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(30,32,54,0.08)]"
          >
            <div className="flex items-start justify-between">
              <MetricIcon className="bg-[#eeeaff] text-[#6d5dfc]">
                ◫
              </MetricIcon>

              <span className="text-[#b5b7c0] transition group-hover:text-[#6d5dfc]">
                ↗
              </span>
            </div>

            <p className="mt-6 text-3xl font-semibold tracking-tight">
              {metrics.openTickets}
            </p>

            <p className="mt-1 text-sm font-medium">
              Open tickets
            </p>

            <p className="mt-1 text-xs text-[#9da0ac]">
              Current support queue
            </p>
          </Link>

          <Link
            href={`/workspaces/${workspace.slug}/tickets`}
            className="group rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(30,32,54,0.08)]"
          >
            <div className="flex items-start justify-between">
              <MetricIcon className="bg-[#fff3dd] text-[#f0a12b]">
                ◎
              </MetricIcon>

              <span className="text-[#b5b7c0] transition group-hover:text-[#f0a12b]">
                ↗
              </span>
            </div>

            <p className="mt-6 text-3xl font-semibold tracking-tight">
              {metrics.unassignedTickets}
            </p>

            <p className="mt-1 text-sm font-medium">
              Unassigned
            </p>

            <p className="mt-1 text-xs text-[#9da0ac]">
              Waiting for ownership
            </p>
          </Link>

          <Link
            href={`/workspaces/${workspace.slug}/incidents`}
            className="group rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(30,32,54,0.08)]"
          >
            <div className="flex items-start justify-between">
              <MetricIcon className="bg-[#e6f8f4] text-[#22a889]">
                ◇
              </MetricIcon>

              <span className="text-[#b5b7c0] transition group-hover:text-[#22a889]">
                ↗
              </span>
            </div>

            <p className="mt-6 text-3xl font-semibold tracking-tight">
              {metrics.activeIncidents}
            </p>

            <p className="mt-1 text-sm font-medium">
              Active incidents
            </p>

            <p className="mt-1 text-xs text-[#9da0ac]">
              Coordinated response
            </p>
          </Link>

          <Link
            href={`/workspaces/${workspace.slug}/incidents`}
            className="group rounded-2xl border border-[#f0dfdf] bg-gradient-to-br from-white to-[#fff8f8] p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(30,32,54,0.08)]"
          >
            <div className="flex items-start justify-between">
              <MetricIcon className="bg-[#ffeaea] text-[#ef5d67]">
                !
              </MetricIcon>

              <span className="text-[#ef5d67]">●</span>
            </div>

            <p className="mt-6 text-3xl font-semibold tracking-tight">
              {metrics.criticalIncidents}
            </p>

            <p className="mt-1 text-sm font-medium">
              Critical incidents
            </p>

            <p className="mt-1 text-xs text-[#9da0ac]">
              Immediate attention
            </p>
          </Link>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-6 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Workload distribution
                </p>

                <p className="mt-1 text-xs text-[#9da0ac]">
                  Current support and incident load
                </p>
              </div>

              <div className="rounded-lg bg-[#f5f5f8] px-3 py-2 text-xs text-[#8d909d]">
                Live snapshot
              </div>
            </div>

            <div className="mt-10 flex h-52 items-end gap-4">
              <div className="flex flex-1 flex-col items-center">
                <div className="flex h-40 w-full max-w-24 items-end overflow-hidden rounded-t-2xl bg-[#f1efff]">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-[#6d5dfc] to-[#9a8eff]"
                    style={{
                      height: `${Math.max(
                        ticketLoad,
                        metrics.openTickets > 0 ? 18 : 2,
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs font-medium">
                  Tickets
                </p>

                <p className="mt-1 text-[11px] text-[#a0a3ae]">
                  {ticketLoad}%
                </p>
              </div>

              <div className="flex flex-1 flex-col items-center">
                <div className="flex h-40 w-full max-w-24 items-end overflow-hidden rounded-t-2xl bg-[#e8f8f4]">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-[#1faa86] to-[#52d0b1]"
                    style={{
                      height: `${Math.max(
                        incidentLoad,
                        metrics.activeIncidents > 0
                          ? 18
                          : 2,
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs font-medium">
                  Incidents
                </p>

                <p className="mt-1 text-[11px] text-[#a0a3ae]">
                  {incidentLoad}%
                </p>
              </div>

              <div className="flex flex-1 flex-col items-center">
                <div className="flex h-40 w-full max-w-24 items-end overflow-hidden rounded-t-2xl bg-[#fff3de]">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-[#f0a12b] to-[#ffc766]"
                    style={{
                      height: `${Math.max(
                        metrics.openTickets > 0
                          ? 100 - assignmentRate
                          : 0,
                        metrics.unassignedTickets > 0
                          ? 18
                          : 2,
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs font-medium">
                  Unassigned
                </p>

                <p className="mt-1 text-[11px] text-[#a0a3ae]">
                  {100 - assignmentRate}%
                </p>
              </div>

              <div className="flex flex-1 flex-col items-center">
                <div className="flex h-40 w-full max-w-24 items-end overflow-hidden rounded-t-2xl bg-[#ffecec]">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-[#ef5d67] to-[#ff8a91]"
                    style={{
                      height: `${Math.max(
                        metrics.activeIncidents > 0
                          ? Math.round(
                              (metrics.criticalIncidents /
                                metrics.activeIncidents) *
                                100,
                            )
                          : 0,
                        metrics.criticalIncidents > 0
                          ? 18
                          : 2,
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs font-medium">
                  Critical
                </p>

                <p className="mt-1 text-[11px] text-[#a0a3ae]">
                  {metrics.criticalIncidents}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#24243a] to-[#17182b] p-6 text-white shadow-xl shadow-[#17182b]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Queue health
                </p>

                <p className="mt-1 text-xs text-white/40">
                  Ownership coverage
                </p>
              </div>

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                ✓
              </span>
            </div>

            <div className="mt-10 flex justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[conic-gradient(#8071ff_var(--progress),rgba(255,255,255,0.08)_0)] p-[12px]"
                style={
                  {
                    "--progress": `${assignmentRate}%`,
                  } as React.CSSProperties
                }
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#1c1d30]">
                  <span className="text-3xl font-semibold">
                    {assignmentRate}%
                  </span>

                  <span className="mt-1 text-xs text-white/40">
                    assigned
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.06] p-3">
                <p className="text-[11px] text-white/40">
                  Assigned
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {Math.max(
                    metrics.openTickets -
                      metrics.unassignedTickets,
                    0,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.06] p-3">
                <p className="text-[11px] text-white/40">
                  Waiting
                </p>

                <p className="mt-1 text-lg font-semibold text-amber-300">
                  {metrics.unassignedTickets}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-[#e7e8ee] bg-white shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between border-b border-[#eff0f4] px-6 py-5">
              <div>
                <p className="text-sm font-semibold">
                  Recent tickets
                </p>

                <p className="mt-1 text-xs text-[#9da0ac]">
                  Latest support activity
                </p>
              </div>

              <Link
                href={`/workspaces/${workspace.slug}/tickets`}
                className="text-xs font-medium text-[#6d5dfc]"
              >
                View all →
              </Link>
            </div>

            {recentTickets.length === 0 ? (
              <div className="p-8 text-sm text-[#9da0ac]">
                No tickets yet.
              </div>
            ) : (
              <div className="divide-y divide-[#f0f1f4]">
                {recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/workspaces/${workspace.slug}/tickets/${ticket.number}`}
                    className="grid gap-3 px-6 py-4 transition hover:bg-[#fafafe] sm:grid-cols-[90px_1fr_100px_50px]"
                  >
                    <span className="text-xs font-semibold text-[#6d5dfc]">
                      {formatTicketNumber(ticket.number)}
                    </span>

                    <span className="truncate text-sm font-medium">
                      {ticket.title}
                    </span>

                    <span className="text-xs text-[#999ca8]">
                      {
                        ticketStatusLabels[
                          ticket.status
                        ]
                      }
                    </span>

                    <span className="text-right text-xs font-semibold text-[#777b87]">
                      {ticket.priority}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e7e8ee] bg-white shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between border-b border-[#eff0f4] px-6 py-5">
              <div>
                <p className="text-sm font-semibold">
                  Incident activity
                </p>

                <p className="mt-1 text-xs text-[#9da0ac]">
                  Latest response events
                </p>
              </div>

              <Link
                href={`/workspaces/${workspace.slug}/incidents`}
                className="text-xs font-medium text-[#ef5d67]"
              >
                View all →
              </Link>
            </div>

            {recentIncidents.length === 0 ? (
              <div className="p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f8f4] text-[#22a889]">
                  ✓
                </div>

                <p className="mt-4 text-sm font-medium">
                  All clear
                </p>

                <p className="mt-1 text-xs text-[#9da0ac]">
                  No recent incidents.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f0f1f4]">
                {recentIncidents.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/workspaces/${workspace.slug}/incidents/${incident.number}`}
                    className="block px-6 py-4 transition hover:bg-[#fffafa]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold text-[#ef5d67]">
                        {formatIncidentNumber(
                          incident.number,
                        )}
                      </span>

                      <span
                        className={`h-2 w-2 rounded-full ${
                          incident.status ===
                          "RESOLVED"
                            ? "bg-emerald-400"
                            : "bg-[#ef5d67]"
                        }`}
                      />
                    </div>

                    <p className="mt-2 truncate text-sm font-medium">
                      {incident.title}
                    </p>

                    <div className="mt-2 flex justify-between text-xs text-[#9da0ac]">
                      <span>
                        {
                          incidentStatusLabels[
                            incident.status
                          ]
                        }
                      </span>

                      <span>{incident.priority}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}