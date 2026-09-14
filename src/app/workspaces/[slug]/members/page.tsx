import { notFound } from "next/navigation";

import { InvitationForm } from "@/features/invitations/components/invitation-form";
import { getMembersPageData } from "@/features/invitations/server/get-members-page-data";
import { MemberActions } from "@/features/members/components/member-actions";
import { RevokeInvitationButton } from "@/features/members/components/revoke-invitation-button";
import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav";
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

  const canManageMembers = hasWorkspacePermission(
    currentMembership.role,
    "members:manage",
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm text-zinc-500">
              OpsDesk Workspace
            </p>
            <h1 className="mt-1 text-xl font-semibold">
              {workspace.name}
            </h1>
          </div>

        </div>
      </header>

      <WorkspaceNav workspaceSlug={workspace.slug} />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Team
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Members & invitations
          </h2>

          <p className="mt-3 text-zinc-400">
            Manage who can access this workspace and what
            permissions they have.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Members
                </h3>

                <span className="text-sm text-zinc-500">
                  {workspace.memberships.length}
                </span>
              </div>

              <div className="space-y-3">
                {workspace.memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          {membership.userId ===
                          currentMembership.userId
                            ? "You"
                            : membership.userId}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          Joined{" "}
                          {membership.joinedAt.toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
                        {membership.role}
                      </span>
                    </div>

                    {canManageMembers && (
                      <MemberActions
                        workspaceId={workspace.id}
                        workspaceSlug={workspace.slug}
                        membershipId={membership.id}
                        actorRole={currentMembership.role}
                        targetRole={membership.role}
                        isCurrentUser={
                          membership.userId ===
                          currentMembership.userId
                        }
                      />
                    )}
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
                <div className="space-y-3">
                  {workspace.invitations.map((invitation) => {
                    const adminCanRevoke =
                      currentMembership.role === "ADMIN" &&
                      invitation.role !== "ADMIN";

                    const canRevoke =
                      currentMembership.role === "OWNER" ||
                      adminCanRevoke;

                    return (
                      <div
                        key={invitation.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">
                              {invitation.email}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              Expires{" "}
                              {invitation.expiresAt.toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>

                          <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
                            {invitation.role}
                          </span>
                        </div>

                        {canRevoke && (
                          <RevokeInvitationButton
                            workspaceId={workspace.id}
                            workspaceSlug={workspace.slug}
                            invitationId={invitation.id}
                          />
                        )}
                      </div>
                    );
                  })}
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
