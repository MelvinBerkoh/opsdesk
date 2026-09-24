import { notFound } from "next/navigation";

import { InvitationForm } from "@/features/invitations/components/invitation-form";
import { getMembersPageData } from "@/features/invitations/server/get-members-page-data";
import { MemberActions } from "@/features/members/components/member-actions";
import { RevokeInvitationButton } from "@/features/members/components/revoke-invitation-button";
import { WorkspaceShell } from "@/features/workspaces/components/workspace-shell";
import { hasWorkspacePermission } from "@/server/authorization/workspace-permissions";

type MembersPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type WorkspaceRole =
  | "OWNER"
  | "ADMIN"
  | "AGENT"
  | "VIEWER";

function getRoleStyle(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "bg-[#17182b] text-white";

    case "ADMIN":
      return "bg-[#eeeaff] text-[#6455e8]";

    case "AGENT":
      return "bg-[#e8f8f2] text-[#278e69]";

    case "VIEWER":
      return "bg-[#eef0f4] text-[#777b87]";
  }
}

function getRoleLabel(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "Owner";

    case "ADMIN":
      return "Admin";

    case "AGENT":
      return "Agent";

    case "VIEWER":
      return "Viewer";
  }
}

function getMemberInitials(
  userId: string,
  isCurrentUser: boolean,
) {
  if (isCurrentUser) {
    return "YOU";
  }

  return userId.slice(-2).toUpperCase();
}

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

  const leadershipCount = workspace.memberships.filter(
    (membership) =>
      membership.role === "OWNER" ||
      membership.role === "ADMIN",
  ).length;

  const agentCount = workspace.memberships.filter(
    (membership) => membership.role === "AGENT",
  ).length;

  const viewerCount = workspace.memberships.filter(
    (membership) => membership.role === "VIEWER",
  ).length;

  return (
    <WorkspaceShell
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      role={currentMembership.role}
    >
      <div className="mx-auto max-w-[1450px] px-6 py-8 lg:px-9 lg:py-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[#6d5dfc]">
              Workspace access
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171927] lg:text-[38px]">
              Members
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8d909d]">
              Manage who can access this workspace and what
              level of operational control they have.
            </p>
          </div>

          {canInvite && (
            <div className="flex items-center gap-2 rounded-xl border border-[#e5e2ff] bg-[#f8f6ff] px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-[#6d5dfc]" />

              <span className="text-xs font-medium text-[#6455e8]">
                Invitations enabled
              </span>
            </div>
          )}
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6d5dfc]">
                ◎
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#afb2bd]">
                Team
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold text-[#171927]">
              {workspace.memberships.length}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Total members
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17182b] text-white">
                ★
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#afb2bd]">
                Leadership
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold text-[#171927]">
              {leadershipCount}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Owners & admins
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f8f2] text-[#278e69]">
                ↗
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#afb2bd]">
                Responders
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold text-[#171927]">
              {agentCount}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Agents
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1dd] text-[#db8d21]">
                ◷
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#afb2bd]">
                Pending
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold text-[#171927]">
              {workspace.invitations.length}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Invitations
            </p>
          </div>
        </section>

        <div
          className={`mt-6 grid gap-6 ${
            canInvite
              ? "xl:grid-cols-[1fr_360px]"
              : ""
          }`}
        >
          <div className="space-y-8">
            <section className="overflow-hidden rounded-[24px] border border-[#e4e6ed] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.045)]">
              <div className="flex items-center justify-between border-b border-[#eff0f4] px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold text-[#272936]">
                    Workspace team
                  </h2>

                  <p className="mt-1 text-xs text-[#9a9daa]">
                    Active members with workspace access.
                  </p>
                </div>

                <span className="rounded-full bg-[#eeeaff] px-3 py-1.5 text-xs font-semibold text-[#6d5dfc]">
                  {workspace.memberships.length} active
                </span>
              </div>

              <div className="divide-y divide-[#eff0f4]">
                {workspace.memberships.map((membership) => {
                  const isCurrentUser =
                    membership.userId ===
                    currentMembership.userId;

                  return (
                    <div
                      key={membership.id}
                      className="px-6 py-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0edff] text-[10px] font-bold text-[#6d5dfc]">
                            {getMemberInitials(
                              membership.userId,
                              isCurrentUser,
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[#30323f]">
                                {isCurrentUser
                                  ? "You"
                                  : membership.userId}
                              </p>

                              {isCurrentUser && (
                                <span className="rounded-full bg-[#f0edff] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6d5dfc]">
                                  Current user
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-[#a0a3ae]">
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
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-full bg-[#edf8f4] px-2.5 py-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#39bb91]" />

                            <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#27896e]">
                              Active
                            </span>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getRoleStyle(
                              membership.role,
                            )}`}
                          >
                            {getRoleLabel(membership.role)}
                          </span>
                        </div>
                      </div>

                      {canManageMembers && (
                        <MemberActions
                          workspaceId={workspace.id}
                          workspaceSlug={workspace.slug}
                          membershipId={membership.id}
                          actorRole={currentMembership.role}
                          targetRole={membership.role}
                          isCurrentUser={isCurrentUser}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-[#e4e6ed] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.045)]">
              <div className="flex items-center justify-between border-b border-[#eff0f4] px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold text-[#272936]">
                    Pending invitations
                  </h2>

                  <p className="mt-1 text-xs text-[#9a9daa]">
                    Invitations waiting to be accepted.
                  </p>
                </div>

                <span className="rounded-full bg-[#fff1dd] px-3 py-1.5 text-xs font-semibold text-[#d98b22]">
                  {workspace.invitations.length}
                </span>
              </div>

              {workspace.invitations.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8f2] text-[#29926b]">
                    ✓
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#343643]">
                    No pending invitations
                  </p>

                  <p className="mt-1 text-xs text-[#9da0ac]">
                    There are no outstanding workspace invites.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#eff0f4]">
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
                        className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1dd] text-sm text-[#db8d21]">
                              ✉
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#343643]">
                                {invitation.email}
                              </p>

                              <p className="mt-1 text-xs text-[#a0a3ae]">
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
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-12 sm:pl-0">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getRoleStyle(
                              invitation.role,
                            )}`}
                          >
                            {getRoleLabel(invitation.role)}
                          </span>

                          {canRevoke && (
                            <RevokeInvitationButton
                              workspaceId={workspace.id}
                              workspaceSlug={workspace.slug}
                              invitationId={invitation.id}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {canInvite && (
            <aside>
              <div className="sticky top-28 space-y-4">
                <InvitationForm
                  workspaceId={workspace.id}
                  currentRole={currentMembership.role}
                />

                <div className="rounded-[22px] bg-[#17182b] p-5 text-white shadow-xl shadow-[#17182b]/10">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9488ff]">
                    Access model
                  </p>

                  <h3 className="mt-3 text-sm font-semibold">
                    Role-based workspace access
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-white/40">
                    Permissions are enforced by the member role
                    assigned inside this workspace.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">
                          Owner
                        </p>

                        <p className="mt-0.5 text-[10px] text-white/30">
                          Workspace authority
                        </p>
                      </div>

                      <span className="text-[10px] text-white/60">
                        Full control
                      </span>
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">
                          Admin
                        </p>

                        <p className="mt-0.5 text-[10px] text-white/30">
                          Team administration
                        </p>
                      </div>

                      <span className="text-[10px] text-white/60">
                        Manage
                      </span>
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">
                          Agent
                        </p>

                        <p className="mt-0.5 text-[10px] text-white/30">
                          Support operations
                        </p>
                      </div>

                      <span className="text-[10px] text-white/60">
                        Respond
                      </span>
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">
                          Viewer
                        </p>

                        <p className="mt-0.5 text-[10px] text-white/30">
                          Visibility only
                        </p>
                      </div>

                      <span className="text-[10px] text-white/60">
                        Read only
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl bg-white/[0.05] px-4 py-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/35">
                        Current viewer count
                      </span>

                      <span className="font-semibold text-white/70">
                        {viewerCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}