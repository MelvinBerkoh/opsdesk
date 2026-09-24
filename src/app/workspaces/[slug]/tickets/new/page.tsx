import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateTicketForm } from "@/features/tickets/components/create-ticket-form";
import { getTicketFormData } from "@/features/tickets/server/get-ticket-form-data";
import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav";
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
              {currentMembership.role}
            </span>
          </div>
        </div>
      </header>

      <WorkspaceNav workspaceSlug={workspace.slug} />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/workspaces/${workspace.slug}/tickets`}
          className="text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to tickets
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Support
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            New ticket
          </h2>

          <p className="mt-3 text-zinc-400">
            Record a new issue and assign it to the right
            service and team member.
          </p>
        </div>

        <div className="mt-8">
          <CreateTicketForm
            workspaceId={workspace.id}
            workspaceSlug={workspace.slug}
            currentMembershipId={currentMembership.id}
            services={workspace.services}
            members={workspace.memberships}
          />
        </div>
      </div>
    </main>
  );
}
