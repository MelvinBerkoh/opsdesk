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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold">Create service</h2>

      <p className="mt-1 text-sm text-zinc-400">
        Add a system or product that your team supports.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-6 space-y-4"
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

        <div>
          <label
            htmlFor="service-name"
            className="block text-sm font-medium text-zinc-200"
          >
            Name
          </label>

          <input
            id="service-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="Payments API"
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="service-description"
            className="block text-sm font-medium text-zinc-200"
          >
            Description
          </label>

          <textarea
            id="service-description"
            name="description"
            maxLength={500}
            rows={4}
            placeholder="Handles payment processing and billing events."
            className="mt-2 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating..." : "Create service"}
        </button>
      </form>

      {state.status !== "idle" && (
        <p
          className={`mt-4 text-sm ${
            state.status === "error"
              ? "text-red-400"
              : "text-emerald-400"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}