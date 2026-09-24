import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
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
    <main className="relative min-h-screen overflow-hidden bg-[#f5f6fb] text-[#171927]">
      <div className="absolute -left-32 -top-44 h-[520px] w-[520px] rounded-full bg-[#6d5dfc]/10 blur-[110px]" />

      <div className="absolute -bottom-52 right-[-100px] h-[500px] w-[500px] rounded-full bg-[#46cda5]/10 blur-[110px]" />

      <header className="relative z-10 border-b border-[#e7e8ee] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6d5dfc] text-sm font-bold text-white shadow-lg shadow-[#6d5dfc]/20">
              OD
            </div>

            <div>
              <p className="text-base font-semibold tracking-tight">
                OpsDesk
              </p>

              <p className="text-[10px] text-[#9a9daa]">
                Operations Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#9a9daa] sm:block">
              Workspace launcher
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeeaff] text-xs font-semibold text-[#6d5dfc]">
              OD
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#6d5dfc]">
              Welcome back
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Where are we working?
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#858894]">
              Jump into a workspace to manage its tickets,
              services, incidents, members, and operational
              activity.
            </p>
          </div>

          <Link
            href="/workspaces/new"
            className="inline-flex items-center justify-center rounded-xl bg-[#17182b] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#17182b]/10 transition hover:-translate-y-0.5 hover:bg-[#27283e]"
          >
            + New workspace
          </Link>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {workspaces.map((workspace, index) => {
            const membership = workspace.memberships[0];

            const initials = workspace.name
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase();

            return (
              <Link
                key={workspace.id}
                href={`/workspaces/${workspace.slug}`}
                className="group relative overflow-hidden rounded-[24px] border border-[#e3e5ec] bg-white p-6 shadow-[0_12px_35px_rgba(37,39,64,0.055)] transition duration-300 hover:-translate-y-1 hover:border-[#d7d2ff] hover:shadow-[0_22px_50px_rgba(37,39,64,0.1)]"
              >
                <div
                  className={`absolute right-[-45px] top-[-55px] h-40 w-40 rounded-full blur-2xl ${
                    index % 2 === 0
                      ? "bg-[#6d5dfc]/10"
                      : "bg-[#42c7a1]/10"
                  }`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold ${
                        index % 2 === 0
                          ? "bg-[#eeeaff] text-[#6d5dfc]"
                          : "bg-[#e6f8f3] text-[#1e9c7d]"
                      }`}
                    >
                      {initials}
                    </div>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e9ef] bg-[#fafbfc] text-[#9a9daa] transition group-hover:border-[#d8d3ff] group-hover:bg-[#f3f0ff] group-hover:text-[#6d5dfc]">
                      →
                    </span>
                  </div>

                  <h2 className="mt-8 text-xl font-semibold tracking-tight">
                    {workspace.name}
                  </h2>

                  <p className="mt-1 text-xs text-[#a0a3ae]">
                    {workspace.slug}
                  </p>

                  <div className="mt-7 flex items-center justify-between border-t border-[#eff0f4] pt-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#afb2bc]">
                        Access
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#565967]">
                        {membership?.role ?? "MEMBER"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-[#edf8f4] px-3 py-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#39bb91]" />

                      <span className="text-[10px] font-semibold text-[#27896e]">
                        Operational
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <div className="mt-8 flex flex-col justify-between gap-3 rounded-2xl border border-[#e3e5ec] bg-white/65 px-5 py-4 text-xs text-[#9a9daa] backdrop-blur sm:flex-row sm:items-center">
          <span>
            {workspaces.length} workspaces available
          </span>

          <span>
            Select a workspace to enter OpsDesk →
          </span>
        </div>
      </div>
    </main>
  );
}