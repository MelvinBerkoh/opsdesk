"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createServiceAction,
  type ServiceActionState,
} from "@/features/services/server/service-actions";

type CreateServiceFormProps = {
  workspaceId: string;
  workspaceSlug: string;
};

const initialState: ServiceActionState = {
  status: "idle",
  message: "",
};

export function CreateServiceForm({
  workspaceId,
  workspaceSlug,
}: CreateServiceFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    createServiceAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="overflow-hidden rounded-[22px] border border-[#e4e6ed] bg-white shadow-[0_10px_35px_rgba(37,39,64,0.05)]"
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

      <div className="border-b border-[#eff0f4] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6d5dfc]">
            +
          </div>

          <div>
            <p className="text-sm font-semibold">
              Add a service
            </p>

            <p className="mt-0.5 text-xs text-[#9a9daa]">
              Track another system your team owns.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label
            htmlFor="service-name"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Service name
          </label>

          <input
            id="service-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="Payments API"
            className="mt-2 w-full rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-4 py-3 text-sm text-[#292b39] outline-none transition placeholder:text-[#b0b3bd] focus:border-[#6d5dfc] focus:bg-white focus:ring-4 focus:ring-[#6d5dfc]/5"
          />
        </div>

        <div>
          <label
            htmlFor="service-description"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9497a3]"
          >
            Description
          </label>

          <textarea
            id="service-description"
            name="description"
            rows={4}
            maxLength={500}
            placeholder="Handles payment processing and billing events."
            className="mt-2 w-full resize-none rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-4 py-3 text-sm text-[#292b39] outline-none transition placeholder:text-[#b0b3bd] focus:border-[#6d5dfc] focus:bg-white focus:ring-4 focus:ring-[#6d5dfc]/5"
          />
        </div>

        {state.status !== "idle" && (
          <div
            className={`rounded-xl px-3.5 py-3 text-xs ${
              state.status === "error"
                ? "border border-[#f1d1d4] bg-[#fff4f5] text-[#d74f5a]"
                : "border border-[#ccebdd] bg-[#eefaf5] text-[#218363]"
            }`}
          >
            {state.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[#6d5dfc] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6d5dfc]/15 transition hover:bg-[#5e4fe8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Adding service..." : "Add service"}
        </button>
      </div>
    </form>
  );
}