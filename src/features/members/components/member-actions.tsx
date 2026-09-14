"use client";

import { useActionState } from "react";

import {
  removeMemberAction,
  type MemberActionState,
  updateMemberRoleAction,
} from "@/features/members/server/member-management-actions";

type WorkspaceRole = "OWNER" | "ADMIN" | "AGENT" | "VIEWER";

type MemberActionsProps = {
  workspaceId: string;
  workspaceSlug: string;
  membershipId: string;
  actorRole: WorkspaceRole;
  targetRole: WorkspaceRole;
  isCurrentUser: boolean;
};

const initialState: MemberActionState = {
  status: "idle",
  message: "",
};

export function MemberActions({
  workspaceId,
  workspaceSlug,
  membershipId,
  actorRole,
  targetRole,
  isCurrentUser,
}: MemberActionsProps) {
  const [roleState, roleAction, rolePending] = useActionState(
    updateMemberRoleAction,
    initialState,
  );

  const [removeState, removeAction, removePending] = useActionState(
    removeMemberAction,
    initialState,
  );

  const ownerCanManage =
    actorRole === "OWNER" &&
    !isCurrentUser &&
    targetRole !== "OWNER";

  const adminCanManage =
    actorRole === "ADMIN" &&
    !isCurrentUser &&
    targetRole !== "OWNER" &&
    targetRole !== "ADMIN";

  const canManage = ownerCanManage || adminCanManage;

  if (!canManage) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
      <form
        action={roleAction}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="hidden"
          name="workspaceId"
          value={workspaceId}
        />
        <input
          type="hidden"
          name="workspaceSlug"
          value={workspaceSlug}
        />
        <input
          type="hidden"
          name="membershipId"
          value={membershipId}
        />

        <select
          name="role"
          defaultValue={targetRole}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          {actorRole === "OWNER" && (
            <option value="ADMIN">Admin</option>
          )}

          <option value="AGENT">Agent</option>
          <option value="VIEWER">Viewer</option>
        </select>

        <button
          type="submit"
          disabled={rolePending}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {rolePending ? "Saving..." : "Change role"}
        </button>
      </form>

      {roleState.status !== "idle" && (
        <p
          className={`text-xs ${
            roleState.status === "error"
              ? "text-red-400"
              : "text-emerald-400"
          }`}
        >
          {roleState.message}
        </p>
      )}

      <form action={removeAction}>
        <input
          type="hidden"
          name="workspaceId"
          value={workspaceId}
        />
        <input
          type="hidden"
          name="workspaceSlug"
          value={workspaceSlug}
        />
        <input
          type="hidden"
          name="membershipId"
          value={membershipId}
        />

        <button
          type="submit"
          disabled={removePending}
          className="text-sm font-medium text-red-400 transition hover:text-red-300 disabled:opacity-50"
        >
          {removePending ? "Removing..." : "Remove member"}
        </button>
      </form>

      {removeState.status === "error" && (
        <p className="text-xs text-red-400">
          {removeState.message}
        </p>
      )}
    </div>
  );
}
