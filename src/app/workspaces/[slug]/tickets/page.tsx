import Link from "next/link";
import { notFound } from "next/navigation";

import { getTicketsPageData } from "@/features/tickets/server/get-tickets-page-data";
import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav";
import { hasWorkspacePermission } from "@/server/authorization/workspace-permissions";

type TicketsPageProps = {
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
  IN_PROGRESS: "In progress",
  WAITING: "Waiting",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
} as const;

function formatTicketNumber(number: number) {
  return `TKT-${String(number).padStart(4, "0")}`;
}

export default async function TicketsPage({
  params,
}: TicketsPageProps) {
  const { slug } = await params;

  const data = await getTicketsPageData(slug);

  if (!data) {
    notFound();
  }

  const { workspace, membership } = data;

  const canCreate = hasWorkspacePermission(
    membership.role,
    "tickets:manage",
  );

  const openCount = workspace.tickets.filter(
    (ticket) =>
      ticket.status !== "RESOLVED" &&
      ticket.status !== "CLOSED",
  ).length;

  const criticalCount = workspace.tickets.filter(
    (ticket) =>
      ticket.priority === "P0" &&
      ticket.status !== "RESOLVED" &&
      ticket.status !== "CLOSED",
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
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
              Support
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Tickets
            </h2>

            <p className="mt-3 text-zinc-400">
              Track reported problems from creation through
              resolution.
            </p>
          </div>

          {canCreate && (
            <Link
              href={`/workspaces/${workspace.slug}/tickets/new`}
              className="inline-flex justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
            >
              New ticket
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">
              Total tickets
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {workspace.tickets.length}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">
              Open tickets
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {openCount}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">
              Critical open
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {criticalCount}
            </p>
          </div>
        </div>

        <section className="mt-10">
          {workspace.tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center">
              <p className="font-medium text-zinc-300">
                No tickets yet
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Create the first ticket when an issue needs
                investigation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {workspace.tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-zinc-500">
                          {formatTicketNumber(ticket.number)}
                        </span>

                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                          {ticket.priority} ·{" "}
                          {priorityLabels[ticket.priority]}
                        </span>

                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                          {statusLabels[ticket.status]}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold">
                        {ticket.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                        <span>
                          Service:{" "}
                          {ticket.service?.name ?? "None"}
                        </span>

                        <span>
                          Assignee:{" "}
                          {ticket.assignee?.userId ??
                            "Unassigned"}
                        </span>

                        <span>
                          Updated{" "}
                          {ticket.updatedAt.toLocaleDateString(
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
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}