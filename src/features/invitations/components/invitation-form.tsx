"use client";

import { useActionState } from "react";

import {
  createInvitationAction,
  type CreateInvitationActionState,
} from "@/features/invitations/server/create-invitation-action";

type InvitationFormProps = {
  workspaceId: string;
  currentRole: "OWNER" | "ADMIN" | "AGENT" | "VIEWER";
};

const initialState: CreateInvitationActionState = {
  status: "idle",
  message: "",
};

export function InvitationForm({
  workspaceId,
  currentRole,
}: InvitationFormProps) {
  const [state, formAction, isPending] = useActionState(
    createInvitationAction,
    initialState,
  );

  const inviteUrl =
    state.invitePath && typeof window !== "undefined"
      ? `${window.location.origin}${state.invitePath}`
      : state.invitePath;

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#e4e6ed] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.05)]">
      <div className="border-b border-[#eff0f4] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-lg text-[#6d5dfc]">
            +
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Invite a member
            </h2>

            <p className="mt-0.5 text-xs text-[#9a9daa]">
              Add someone to this workspace.
            </p>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-5 p-5">
        <input
          type="hidden"
          name="workspaceId"
          value={workspaceId}
        />

        <div>
          <label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="teammate@example.com"
            className="mt-2 w-full rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-4 py-3 text-sm text-[#292b39] outline-none transition placeholder:text-[#b0b3bd] focus:border-[#6d5dfc] focus:bg-white focus:ring-4 focus:ring-[#6d5dfc]/5"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Workspace role
          </label>

          <select
            id="role"
            name="role"
            defaultValue="AGENT"
            className="mt-2 w-full rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-4 py-3 text-sm text-[#292b39] outline-none transition focus:border-[#6d5dfc] focus:bg-white focus:ring-4 focus:ring-[#6d5dfc]/5"
          >
            {currentRole === "OWNER" && (
              <option value="ADMIN">Admin</option>
            )}

            <option value="AGENT">Agent</option>
            <option value="VIEWER">Viewer</option>
          </select>

          <p className="mt-2 text-xs leading-5 text-[#a0a3ae]">
            Agents can work tickets and incidents. Viewers have
            read-only access.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[#6d5dfc] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6d5dfc]/15 transition hover:bg-[#5e4fe8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Creating invitation..."
            : "Create invitation →"}
        </button>
      </form>

      {state.status !== "idle" && (
        <div className="border-t border-[#eff0f4] p-5">
          <div
            className={`rounded-xl border p-4 text-sm ${
              state.status === "success"
                ? "border-[#cdeade] bg-[#effaf5] text-[#247c5c]"
                : "border-[#f1d1d4] bg-[#fff4f5] text-[#d74f5a]"
            }`}
          >
            <p className="font-medium">
              {state.message}
            </p>

            {state.status === "success" && inviteUrl && (
              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#70a08d]">
                  One-time invite link
                </p>

                <input
                  readOnly
                  value={inviteUrl}
                  onFocus={(event) =>
                    event.currentTarget.select()
                  }
                  className="mt-2 w-full rounded-xl border border-[#cfe7dd] bg-white px-3 py-2.5 text-xs text-[#4d6259] outline-none"
                />

                <p className="mt-2 text-xs leading-5 text-[#79a08f]">
                  Copy this link now. OpsDesk stores only the
                  token hash, so it cannot be reconstructed
                  later.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}