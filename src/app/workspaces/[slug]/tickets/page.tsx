import Link from "next/link";
import { notFound } from "next/navigation";

import { getTicketsPageData } from "@/features/tickets/server/get-tickets-page-data";
import { WorkspaceShell } from "@/features/workspaces/components/workspace-shell";
import { hasWorkspacePermission } from "@/server/authorization/workspace-permissions";

type TicketsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const statusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING: "Waiting",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
} as const;

const priorityLabels = {
  P0: "Critical",
  P1: "High",
  P2: "Medium",
  P3: "Low",
} as const;

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

  const resolvedCount = workspace.tickets.filter(
    (ticket) =>
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED",
  ).length;

  return (
    <WorkspaceShell
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      role={membership.role}
    >
      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-9 lg:py-10">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-[#6d5dfc]">
              Support operations
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171927] lg:text-[38px]">
              Tickets
            </h1>

            <p className="mt-2 text-sm text-[#8d909d]">
              Track, assign, and resolve support issues across
              your workspace.
            </p>
          </div>

          {canCreate && (
            <Link
              href={`/workspaces/${workspace.slug}/tickets/new`}
              className="inline-flex items-center justify-center rounded-xl bg-[#6d5dfc] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#6d5dfc]/20 transition hover:bg-[#5e4fe8]"
            >
              + New ticket
            </Link>
          )}
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6d5dfc]">
                ◫
              </div>

              <span className="text-xs text-[#afb2bd]">
                TOTAL
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {workspace.tickets.length}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              All tickets
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f8f5] text-[#20a786]">
                ↻
              </div>

              <span className="text-xs text-[#afb2bd]">
                ACTIVE
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {openCount}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Open workload
            </p>
          </div>

          <div className="rounded-2xl border border-[#f0dfdf] bg-gradient-to-br from-white to-[#fffafa] p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe9ea] text-[#ef5d67]">
                !
              </div>

              <span className="text-xs text-[#ef5d67]">
                P0
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {criticalCount}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Critical open
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f8ee] text-[#31a166]">
                ✓
              </div>

              <span className="text-xs text-[#afb2bd]">
                DONE
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

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e7e8ee] bg-white shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[#eff0f4] px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold">
                Support queue
              </h2>

              <p className="mt-1 text-xs text-[#9da0ac]">
                {workspace.tickets.length} tickets across all
                statuses
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg bg-[#17182b] px-3 py-2 text-xs font-medium text-white">
                All
              </button>

              <button className="rounded-lg bg-[#f4f5f8] px-3 py-2 text-xs font-medium text-[#7d808d]">
                Open
              </button>

              <button className="rounded-lg bg-[#f4f5f8] px-3 py-2 text-xs font-medium text-[#7d808d]">
                In progress
              </button>

              <button className="rounded-lg bg-[#f4f5f8] px-3 py-2 text-xs font-medium text-[#7d808d]">
                Resolved
              </button>
            </div>
          </div>

          {workspace.tickets.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeaff] text-xl text-[#6d5dfc]">
                ◫
              </div>

              <p className="mt-4 font-medium">
                Your queue is empty
              </p>

              <p className="mt-1 text-sm text-[#9da0ac]">
                Create a ticket when something needs attention.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[110px_1fr_150px_130px_160px_90px] border-b border-[#eff0f4] bg-[#fafbfc] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a1a4af] md:grid">
                <span>Ticket</span>
                <span>Issue</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Service</span>
                <span />
              </div>

              <div className="divide-y divide-[#eff0f4]">
                {workspace.tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/workspaces/${workspace.slug}/tickets/${ticket.number}`}
                    className="grid gap-4 px-6 py-5 transition hover:bg-[#fafafe] md:grid-cols-[110px_1fr_150px_130px_160px_90px] md:items-center"
                  >
                    <span className="text-xs font-semibold text-[#6d5dfc]">
                      {formatTicketNumber(ticket.number)}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#252735]">
                        {ticket.title}
                      </p>

                      <p className="mt-1 text-xs text-[#a0a3ae] md:hidden">
                        {ticket.service?.name ?? "No service"}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          ticket.status,
                        )}`}
                      >
                        {statusLabels[ticket.status]}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                          ticket.priority,
                        )}`}
                      >
                        {ticket.priority} ·{" "}
                        {priorityLabels[ticket.priority]}
                      </span>
                    </div>

                    <span className="hidden truncate text-sm text-[#777b87] md:block">
                      {ticket.service?.name ?? "—"}
                    </span>

                    <span className="hidden text-right text-xs font-medium text-[#6d5dfc] md:block">
                      View →
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