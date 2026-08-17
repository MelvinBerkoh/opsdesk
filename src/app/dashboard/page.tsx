import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth.protect();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold">OpsDesk</p>
            <p className="text-sm text-zinc-400">
              Support and incident management
            </p>
          </div>

          <UserButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Authentication is working.
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          You are signed in and viewing a server-protected OpsDesk resource.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Authenticated user</p>
          <code className="mt-2 block break-all text-sm text-zinc-200">
            {userId}
          </code>
        </div>
      </div>
    </main>
  );
}
