import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateTicketForm } from "@/features/tickets/components/create-ticket-form";
import { getTicketFormData } from "@/features/tickets/server/get-ticket-form-data";
import { WorkspaceShell } from "@/features/workspaces/components/workspace-shell";
import { hasWorkspacePermission } from "@/server/authorization/workspace-permissions";

type NewTicketPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function NewTicketPage({
  params,
}: NewTicketPageProps) {
  const { slug } = await params;

  const data = await getTicketFormData(slug);

  if (!data) {
    notFound();
  }

  const { workspace, currentMembership } = data;

  const canCreate = hasWorkspacePermission(
    currentMembership.role,
    "tickets:manage",
  );

  if (!canCreate) {
    notFound();
  }

  return (
    <WorkspaceShell
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      role={currentMembership.role}
    >
      <div className="mx-auto max-w-[1100px] px-6 py-8 lg:px-9 lg:py-10">
        <Link
          href={`/workspaces/${workspace.slug}/tickets`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#858895] transition hover:text-[#6d5dfc]"
        >
          ← Back to tickets
        </Link>

        <div className="mt-7">
          <p className="text-sm font-semibold text-[#6d5dfc]">
            Support operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171927] lg:text-[38px]">
            Create a ticket
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8d909d]">
            Capture the issue, set its urgency, and route it to
            the right service and owner.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_290px]">
          <CreateTicketForm
            workspaceId={workspace.id}
            workspaceSlug={workspace.slug}
            currentMembershipId={currentMembership.id}
            services={workspace.services}
            members={workspace.memberships}
          />

          <aside className="space-y-4">
            <div className="rounded-2xl bg-[#17182b] p-6 text-white shadow-xl shadow-[#17182b]/10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9488ff]">
                Ticket workflow
              </p>

              <h2 className="mt-3 text-lg font-semibold">
                Start with the right context.
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/45">
                A well-routed ticket is easier to investigate,
                assign, and escalate if the issue becomes
                serious.
              </p>

              <div className="mt-7 space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6d5dfc] text-[10px] font-bold">
                    1
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Describe the issue
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/35">
                      Explain what is happening and who is
                      affected.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/60">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Set priority
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/35">
                      P0 is critical. P3 is low urgency.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/60">
                    3
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Route ownership
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/35">
                      Connect the affected service and assign a
                      responder.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e4e6ed] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6d5dfc]">
                  ↗
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Escalation ready
                  </p>

                  <p className="mt-0.5 text-xs text-[#9a9daa]">
                    Tickets can become incidents later.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}