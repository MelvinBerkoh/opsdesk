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
    useActionState(
      updateServiceAction,
      initialState,
    );

  const [archiveState, archiveAction, archivePending] =
    useActionState(
      archiveServiceAction,
      initialState,
    );

  const fieldClass =
    "w-full rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-3.5 py-2.5 text-sm text-[#292b39] outline-none transition focus:border-[#6d5dfc] focus:bg-white focus:ring-4 focus:ring-[#6d5dfc]/5";

  return (
    <div className="mt-5 border-t border-[#eff0f4] pt-5">
      <form
        action={updateAction}
        className="space-y-3"
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
          className={fieldClass}
        />

        <textarea
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={service.description ?? ""}
          className={`${fieldClass} resize-none`}
        />

        <button
          type="submit"
          disabled={updatePending}
          className="rounded-xl bg-[#17182b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#292a40] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updatePending
            ? "Saving..."
            : "Save changes"}
        </button>
      </form>

      {updateState.status !== "idle" && (
        <p
          className={`mt-3 text-xs ${
            updateState.status === "error"
              ? "text-[#d74f5a]"
              : "text-[#218363]"
          }`}
        >
          {updateState.message}
        </p>
      )}

      <form
        action={archiveAction}
        className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-[#fff7f7] px-3.5 py-3"
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
          name="serviceId"
          value={service.id}
        />

        <div>
          <p className="text-xs font-medium text-[#7d6265]">
            No longer supporting this service?
          </p>

          {archiveState.status === "error" && (
            <p className="mt-1 text-xs text-[#d74f5a]">
              {archiveState.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={archivePending}
          className="shrink-0 text-xs font-semibold text-[#df5661] transition hover:text-[#c73f4a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {archivePending
            ? "Archiving..."
            : "Archive"}
        </button>
      </form>
    </div>
  );
}