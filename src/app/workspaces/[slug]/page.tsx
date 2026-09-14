import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav";
import { getWorkspaceForUser } from "@/features/workspaces/server/get-workspace-for-user";

type WorkspacePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function WorkspacePage({
  params,
}: WorkspacePageProps) {
  const { userId } = await auth.protect();
  const { slug } = await params;

  const workspace = await getWorkspaceForUser({
    slug,
    userId,
  });

  if (!workspace) {
    notFound();
  }

  const membership = workspace.memberships[0];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-sm text-zinc-500">
            OpsDesk Workspace
          </p>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              {workspace.name}
            </h1>

            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
              {membership?.role}
            </span>
          </div>
        </div>
      </header>

      <WorkspaceNav workspaceSlug={workspace.slug} />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Overview
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Workspace overview
        </h2>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Services, tickets, incidents, and operational activity
          will appear here as the workspace grows.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Open tickets</p>
            <p className="mt-2 text-2xl font-semibold">0</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Open incidents</p>
            <p className="mt-2 text-2xl font-semibold">0</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Critical incidents</p>
            <p className="mt-2 text-2xl font-semibold">0</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">SLA at risk</p>
            <p className="mt-2 text-2xl font-semibold">0</p>
          </div>
        </div>
      </div>
    </main>
  );
}
