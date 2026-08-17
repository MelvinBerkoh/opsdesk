import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getUserWorkspaces } from "@/features/workspaces/server/get-user-workspaces";

export default async function DashboardPage() {
  const { userId } = await auth.protect();

  const workspaces = await getUserWorkspaces(userId);

  if (workspaces.length === 0) {
    redirect("/workspaces/new");
  }

  if (workspaces.length === 1) {
    redirect(`/workspaces/${workspaces[0].slug}`);
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          OpsDesk
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Choose a workspace
        </h1>

        <p className="mt-3 text-zinc-400">
          Select the team you want to manage.
        </p>

        <div className="mt-8 space-y-3">
          {workspaces.map((workspace) => {
            const membership = workspace.memberships[0];

            return (
              <Link
                key={workspace.id}
                href={`/workspaces/${workspace.slug}`}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                <div>
                  <p className="font-medium">{workspace.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {workspace.slug}
                  </p>
                </div>

                <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
                  {membership?.role}
                </span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/workspaces/new"
          className="mt-6 inline-flex rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
        >
          Create another workspace
        </Link>
      </div>
    </main>
  );
}
