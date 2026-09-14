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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold">Invite a member</h2>

      <p className="mt-1 text-sm text-zinc-400">
        Invite someone to join this workspace.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="workspaceId" value={workspaceId} />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-200"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="teammate@example.com"
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-zinc-200"
          >
            Role
          </label>

          <select
            id="role"
            name="role"
            defaultValue="AGENT"
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none focus:border-zinc-500"
          >
            {currentRole === "OWNER" && (
              <option value="ADMIN">Admin</option>
            )}

            <option value="AGENT">Agent</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating invitation..." : "Create invitation"}
        </button>
      </form>

      {state.status !== "idle" && (
        <div
          className={`mt-5 rounded-lg border p-4 text-sm ${
            state.status === "success"
              ? "border-emerald-900 bg-emerald-950/40 text-emerald-300"
              : "border-red-900 bg-red-950/40 text-red-300"
          }`}
        >
          <p>{state.message}</p>

          {state.status === "success" && inviteUrl && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                One-time invite link
              </p>

              <input
                readOnly
                value={inviteUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Save or copy this link now. OpsDesk stores only the token hash,
                so the link cannot be reconstructed later.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
