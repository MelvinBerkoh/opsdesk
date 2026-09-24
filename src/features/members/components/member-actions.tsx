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

  const [removeState, removeAction, removePending] =
    useActionState(removeMemberAction, initialState);

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
    <div className="mt-5 border-t border-[#eff0f4] pt-5">
      <form
        action={roleAction}
        className="flex flex-col gap-3 sm:flex-row"
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
          className="min-w-0 flex-1 rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-3.5 py-2.5 text-sm text-[#343643] outline-none transition focus:border-[#6d5dfc] focus:bg-white focus:ring-4 focus:ring-[#6d5dfc]/5"
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
          className="rounded-xl bg-[#17182b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#292a40] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {rolePending ? "Saving..." : "Update role"}
        </button>
      </form>

      {roleState.status !== "idle" && (
        <p
          className={`mt-3 text-xs ${
            roleState.status === "error"
              ? "text-[#d74f5a]"
              : "text-[#218363]"
          }`}
        >
          {roleState.message}
        </p>
      )}

      <form
        action={removeAction}
        className="mt-4 flex items-center justify-between rounded-xl bg-[#fff7f7] px-3.5 py-3"
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

        <div>
          <p className="text-xs font-medium text-[#7e6668]">
            Remove workspace access
          </p>

          {removeState.status === "error" && (
            <p className="mt-1 text-xs text-[#d74f5a]">
              {removeState.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={removePending}
          className="text-xs font-semibold text-[#df5661] transition hover:text-[#c6404b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {removePending ? "Removing..." : "Remove"}
        </button>
      </form>
    </div>
  );
}