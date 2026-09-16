"use client";

import { useActionState } from "react";

import {
  archiveServiceAction,
  type ServiceActionState,
  updateServiceAction,
} from "@/features/services/server/service-actions";

type ServiceActionsProps = {
  workspaceId: string;
  workspaceSlug: string;
  service: {
    id: string;
    name: string;
    description: string | null;
  };
};

const initialState: ServiceActionState = {
  status: "idle",
  message: "",
};

export function ServiceActions({
  workspaceId,
  workspaceSlug,
  service,
}: ServiceActionsProps) {
  const [updateState, updateAction, updatePending] =
    useActionState(updateServiceAction, initialState);

  const [archiveState, archiveAction, archivePending] =
    useActionState(archiveServiceAction, initialState);

  return (
    <div className="mt-5 border-t border-zinc-800 pt-5">
      <form action={updateAction} className="space-y-3">
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
          name="serviceId"
          value={service.id}
        />

        <input
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={service.name}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />

        <textarea
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={service.description ?? ""}
          className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />

        <button
          type="submit"
          disabled={updatePending}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {updatePending ? "Saving..." : "Save changes"}
        </button>
      </form>

      {updateState.status !== "idle" && (
        <p
          className={`mt-3 text-xs ${
            updateState.status === "error"
              ? "text-red-400"
              : "text-emerald-400"
          }`}
        >
          {updateState.message}
        </p>
      )}

      <form action={archiveAction} className="mt-4">
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
          name="serviceId"
          value={service.id}
        />

        <button
          type="submit"
          disabled={archivePending}
          className="text-sm font-medium text-red-400 transition hover:text-red-300 disabled:opacity-50"
        >
          {archivePending ? "Archiving..." : "Archive service"}
        </button>
      </form>

      {archiveState.status === "error" && (
        <p className="mt-3 text-xs text-red-400">
          {archiveState.message}
        </p>
      )}
    </div>
  );
}