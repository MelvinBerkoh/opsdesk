import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

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
          <p className="text-sm text-zinc-500">OpsDesk Workspace</p>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl font-semibold">{workspace.name}</h1>

            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
              {membership?.role}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Workspace
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Multi-tenancy is alive.
        </h2>

        <p className="mt-3 max-w-2xl text-zinc-400">
          This workspace was loaded through an authenticated membership-scoped
          database query.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Workspace slug</p>
            <code className="mt-2 block text-sm text-zinc-200">
              {workspace.slug}
            </code>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Your role</p>
            <p className="mt-2 text-sm font-medium text-zinc-200">
              {membership?.role}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
