import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createWorkspace } from "@/features/workspaces/server/create-workspace";

export default async function NewWorkspacePage() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <div className="w-full max-w-lg">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          OpsDesk
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Create your workspace
        </h1>

        <p className="mt-3 text-zinc-400">
          A workspace is the security boundary for your team, incidents, and
          support operations.
        </p>

        <form
          action={createWorkspace}
          className="mt-8 space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-200"
            >
              Workspace name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              autoComplete="organization"
              placeholder="Acme Engineering"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-100 px-4 py-2.5 font-medium text-zinc-950 transition hover:bg-white"
          >
            Create workspace
          </button>
        </form>
      </div>
    </main>
  );
}
