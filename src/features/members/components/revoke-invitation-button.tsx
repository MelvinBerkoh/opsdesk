"use client";

import { useActionState } from "react";

import {
  revokeInvitationAction,
  type MemberActionState,
} from "@/features/members/server/member-management-actions";

type RevokeInvitationButtonProps = {
  workspaceId: string;
  workspaceSlug: string;
  invitationId: string;
};

const initialState: MemberActionState = {
  status: "idle",
  message: "",
};

export function RevokeInvitationButton({
  workspaceId,
  workspaceSlug,
  invitationId,
}: RevokeInvitationButtonProps) {
  const [state, formAction, isPending] = useActionState(
    revokeInvitationAction,
    initialState,
  );

  return (
    <div className="mt-3">
      <form action={formAction}>
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
          name="invitationId"
          value={invitationId}
        />

        <button
          type="submit"
          disabled={isPending}
          className="text-xs font-medium text-red-400 transition hover:text-red-300 disabled:opacity-50"
        >
          {isPending ? "Revoking..." : "Revoke invitation"}
        </button>
      </form>

      {state.status === "error" && (
        <p className="mt-2 text-xs text-red-400">
          {state.message}
        </p>
      )}
    </div>
  );
}
