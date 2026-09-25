import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OpsDeskLogo } from "@/components/brand/opsdesk-logo";
import { createWorkspace } from "@/features/workspaces/server/create-workspace";

export const metadata: Metadata = {
  title: "Create Workspace",
  description: "Create a new OpsDesk workspace for your team.",
};

export default async function NewWorkspacePage() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-[#f4f6fb] text-[#171927]">
      <header className="border-b border-[#e7e8ee] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            aria-label="OpsDesk home"
            className="transition-opacity hover:opacity-90"
          >
            <OpsDeskLogo
              size={40}
              showWordmark
              subtitle
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden text-xs font-medium text-[#858894] transition hover:text-[#6d5dfc] sm:block"
            >
              Back to home
            </Link>

            <div className="h-8 w-px bg-[#e7e8ee]" />

            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "h-10 w-10 rounded-xl",
                  userButtonPopoverCard:
                    "rounded-2xl shadow-xl",
                },
              }}
            />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute -left-40 top-8 h-[480px] w-[480px] rounded-full bg-[#6d5dfc]/10 blur-[120px]" />

        <div className="absolute -right-40 bottom-0 h-[460px] w-[460px] rounded-full bg-[#48cba5]/10 blur-[120px]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dedafc] bg-[#f0edff] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#6d5dfc]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#6d5dfc]">
                Workspace setup
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-[56px] lg:leading-[1.02]">
              Give your team a place to run operations.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#858894]">
              A workspace keeps your team, services, tickets,
              incidents, and permissions together in one secure
              place.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex gap-4 rounded-2xl border border-[#e4e6ed] bg-white/75 p-4 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eeeaff] text-sm font-semibold text-[#6d5dfc]">
                  01
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#343643]">
                    Separate your operations
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#9295a1]">
                    Each workspace keeps its members, tickets,
                    services, and incidents separate.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-[#e4e6ed] bg-white/75 p-4 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f8f3] text-sm font-semibold text-[#249273]">
                  02
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#343643]">
                    You start as the owner
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#9295a1]">
                    You can invite teammates and control their
                    access after the workspace is created.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-[#e4e6ed] bg-white/75 p-4 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff2df] text-sm font-semibold text-[#c57d16]">
                  03
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#343643]">
                    Start with one name
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#9295a1]">
                    OpsDesk handles the workspace setup. You can
                    add services and members once you&apos;re inside.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl">
            <div className="overflow-hidden rounded-[28px] border border-[#e1e3eb] bg-white shadow-[0_28px_80px_rgba(35,37,58,0.1)]">
              <div className="border-b border-[#eceef3] px-7 py-6 sm:px-8">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d5dfc]">
                      New workspace
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
                      Create your workspace
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeaff]">
                    <span className="text-lg font-semibold text-[#6d5dfc]">
                      +
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#8b8e9a]">
                  Start with a name. You can build out the rest
                  of the workspace after it&apos;s created.
                </p>
              </div>

              <form
                action={createWorkspace}
                className="px-7 py-7 sm:px-8 sm:py-8"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="text-xs font-semibold text-[#444754]"
                  >
                    Workspace name
                  </label>

                  <p className="mt-1 text-[11px] leading-5 text-[#9a9daa]">
                    Usually your company, team, or project name.
                  </p>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="organization"
                    autoFocus
                    placeholder="Acme Engineering"
                    className="mt-3 w-full rounded-xl border border-[#dfe1e8] bg-[#fafbfc] px-4 py-3.5 text-sm text-[#242632] outline-none transition placeholder:text-[#b7bac3] hover:border-[#d3d0ea] focus:border-[#6d5dfc] focus:bg-white focus:ring-4 focus:ring-[#6d5dfc]/10"
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-[#ebecef] bg-[#f8f9fc] p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs text-[#6d5dfc] shadow-sm">
                      ✓
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#555865]">
                        Your workspace is private
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#979aa6]">
                        Only members you invite can access this
                        workspace and its operational data.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d5dfc] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#6d5dfc]/20 transition hover:-translate-y-0.5 hover:bg-[#5e4fe8] active:translate-y-0"
                >
                  Create workspace
                  <span aria-hidden="true">→</span>
                </button>

                <p className="mt-4 text-center text-[10px] leading-5 text-[#a3a6b0]">
                  You&apos;ll be added as the workspace owner
                  automatically.
                </p>
              </form>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#a0a3ae]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#41bd94]" />
              Secure workspace isolation powered by OpsDesk
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}