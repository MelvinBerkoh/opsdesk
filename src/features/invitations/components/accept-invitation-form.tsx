"use client";

import { useActionState } from "react";

import {
  acceptInvitationAction,
  type AcceptInvitationActionState,
} from "@/features/invitations/server/accept-invitation-action";
/**
 * What this does: Gives the user the actual Accept invitation button.
 *
 * Why: useActionState lets us call the server action and display errors without moving sensitive invitation logic into browser code.
 */
type AcceptInvitationFormProps = {
  token: string;
};

const initialState: AcceptInvitationActionState = {
  status: "idle",
  message: "",
};

export function AcceptInvitationForm({
  token,
}: AcceptInvitationFormProps) {
  const [state, formAction, isPending] = useActionState(
    acceptInvitationAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-zinc-100 px-4 py-2.5 font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Joining workspace..." : "Accept invitation"}
      </button>

      {state.status === "error" && (
        <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {state.message}
        </div>
      )}
    </form>
  );
}