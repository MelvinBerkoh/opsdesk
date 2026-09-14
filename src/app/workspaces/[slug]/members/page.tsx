import Link from "next/link";
import { notFound } from "next/navigation";

import { InvitationForm } from "@/features/invitations/components/invitation-form";
import { getMembersPageData } from "@/features/invitations/server/get-members-page-data";
import { hasWorkspacePermission } from "@/server/authorization/workspace-permissions";

type MembersPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function MembersPage({
  params,
}: MembersPageProps) {
  const { slug } = await params;

  const data = await getMembersPageData(slug);

  if (!data) {
    notFound();
  }

  const { workspace, currentMembership } = data;

  const canInvite = hasWorkspacePermission(
    currentMembership.role,
    "members:invite",
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm text-zinc-500">OpsDesk Workspace</p>
            <h1 className="mt-1 text-xl font-semibold">{workspace.name}</h1>
          </div>

          <Link
            href={`/workspaces/${workspace.slug}`}
            className="text-sm text-zinc-400 transition hover:text-zinc-100"
          >
            Back to workspace
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Team
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Members & invitations
          </h2>

          <p className="mt-3 text-zinc-400">
            Manage who can access this workspace.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Members</h3>

                <span className="text-sm text-zinc-500">
                  {workspace.memberships.length}
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-800">
                {workspace.memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5 py-4 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {membership.userId === currentMembership.userId
                          ? "You"
                          : membership.userId}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Joined{" "}
                        {membership.joinedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
                      {membership.role}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Pending invitations
                </h3>

                <span className="text-sm text-zinc-500">
                  {workspace.invitations.length}
                </span>
              </div>

              {workspace.invitations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-8 text-sm text-zinc-500">
                  No pending invitations.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-zinc-800">
                  {workspace.invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5 py-4 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {invitation.email}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          Expires{" "}
                          {invitation.expiresAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
                        {invitation.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {canInvite && (
            <aside>
              <InvitationForm
                workspaceId={workspace.id}
                currentRole={currentMembership.role}
              />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
