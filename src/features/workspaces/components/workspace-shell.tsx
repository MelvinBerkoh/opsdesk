"use client";

import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

type WorkspaceRole =
  | "OWNER"
  | "ADMIN"
  | "AGENT"
  | "VIEWER";

type WorkspaceShellProps = {
  children: ReactNode;
  workspaceName: string;
  workspaceSlug: string;
  role: WorkspaceRole;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: string;
  active: boolean;
};

function getCurrentSection(
  pathname: string,
  workspaceSlug: string,
) {
  if (
    pathname.startsWith(
      `/workspaces/${workspaceSlug}/tickets`,
    )
  ) {
    return {
      title: "Tickets",
      description: "Support queue and ticket operations",
    };
  }

  if (
    pathname.startsWith(
      `/workspaces/${workspaceSlug}/incidents`,
    )
  ) {
    return {
      title: "Incidents",
      description: "Incident response and escalation",
    };
  }

  if (
    pathname.startsWith(
      `/workspaces/${workspaceSlug}/services`,
    )
  ) {
    return {
      title: "Services",
      description: "Systems and service ownership",
    };
  }

  if (
    pathname.startsWith(
      `/workspaces/${workspaceSlug}/members`,
    )
  ) {
    return {
      title: "Members",
      description: "Workspace access and permissions",
    };
  }

  return {
    title: "Overview",
    description: "Workspace operations at a glance",
  };
}

export function WorkspaceShell({
  children,
  workspaceName,
  workspaceSlug,
  role,
}: WorkspaceShellProps) {
  const pathname = usePathname();

  const navigation: NavigationItem[] = [
    {
      label: "Overview",
      href: `/workspaces/${workspaceSlug}`,
      icon: "◫",
      active:
        pathname === `/workspaces/${workspaceSlug}`,
    },
    {
      label: "Tickets",
      href: `/workspaces/${workspaceSlug}/tickets`,
      icon: "↗",
      active: pathname.startsWith(
        `/workspaces/${workspaceSlug}/tickets`,
      ),
    },
    {
      label: "Incidents",
      href: `/workspaces/${workspaceSlug}/incidents`,
      icon: "⚡",
      active: pathname.startsWith(
        `/workspaces/${workspaceSlug}/incidents`,
      ),
    },
    {
      label: "Services",
      href: `/workspaces/${workspaceSlug}/services`,
      icon: "◇",
      active: pathname.startsWith(
        `/workspaces/${workspaceSlug}/services`,
      ),
    },
    {
      label: "Members",
      href: `/workspaces/${workspaceSlug}/members`,
      icon: "◎",
      active: pathname.startsWith(
        `/workspaces/${workspaceSlug}/members`,
      ),
    },
  ];

  const initials = workspaceName
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const currentSection = getCurrentSection(
    pathname,
    workspaceSlug,
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#171927]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-[#17182b] text-white lg:flex">
        <div className="flex h-[76px] items-center border-b border-white/[0.06] px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6d5dfc] text-xs font-bold text-white shadow-lg shadow-black/20">
              OD
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight">
                OpsDesk
              </p>

              <p className="mt-0.5 text-[9px] text-white/30">
                Operations Platform
              </p>
            </div>
          </Link>
        </div>

        <div className="px-4 pt-5">
          <Link
            href="/dashboard"
            className="block rounded-2xl border border-white/[0.06] bg-white/[0.045] p-3.5 transition hover:bg-white/[0.07]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6d5dfc]/20 text-xs font-bold text-[#aaa1ff]">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white/90">
                  {workspaceName}
                </p>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#50d0a5]" />

                  <span className="text-[9px] text-white/35">
                    Operational
                  </span>
                </div>
              </div>

              <span className="text-xs text-white/20">
                ↕
              </span>
            </div>
          </Link>
        </div>

        <nav className="mt-6 flex-1 px-3">
          <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/20">
            Workspace
          </p>

          <div className="mt-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  item.active
                    ? "bg-[#6d5dfc] font-medium text-white shadow-lg shadow-[#6d5dfc]/15"
                    : "text-white/45 hover:bg-white/[0.05] hover:text-white/80"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
                    item.active
                      ? "bg-white/10"
                      : "bg-white/[0.035]"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/20">
              Your access
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-medium text-white/70">
                {role}
              </span>

              <span className="rounded-full bg-[#5ed3ad]/10 px-2 py-1 text-[9px] font-semibold text-[#6ddbb9]">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-[#e7e8ee] bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6d5dfc] text-xs font-bold text-white lg:hidden"
              >
                OD
              </Link>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#292b38]">
                  {currentSection.title}
                </p>

                <p className="mt-0.5 hidden text-[11px] text-[#9a9daa] sm:block">
                  {currentSection.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href={`/workspaces/${workspaceSlug}/tickets/new`}
                className="hidden items-center gap-2 rounded-xl bg-[#6d5dfc] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#6d5dfc]/15 transition hover:bg-[#5e4fe8] sm:inline-flex"
              >
                <span>+</span>
                <span>New ticket</span>
              </Link>

              <Link
                href="/dashboard"
                className="hidden rounded-xl border border-[#e3e5ec] bg-white px-4 py-2.5 text-xs font-semibold text-[#626572] transition hover:border-[#d7d2ff] hover:bg-[#f8f7ff] hover:text-[#6d5dfc] md:block"
              >
                Switch workspace
              </Link>

              <div className="hidden h-8 w-px bg-[#e7e8ee] sm:block" />

              <div className="flex items-center gap-3 rounded-xl border border-transparent px-1.5 py-1">
                <div className="hidden text-right xl:block">
                  <p className="max-w-[150px] truncate text-xs font-semibold text-[#343643]">
                    {workspaceName}
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#a0a3ae]">
                    {role}
                  </p>
                </div>

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "h-9 w-9 rounded-xl",
                    userButtonPopoverCard:
                        "rounded-2xl shadow-xl",
                  },
                  }}
                />
              </div>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-[#eff0f4] bg-white px-4 py-2 lg:hidden">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  item.active
                    ? "bg-[#eeeaff] text-[#6d5dfc]"
                    : "text-[#858895]"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href={`/workspaces/${workspaceSlug}/tickets/new`}
              className="ml-auto shrink-0 rounded-lg bg-[#6d5dfc] px-3 py-2 text-xs font-semibold text-white sm:hidden"
            >
              + Ticket
            </Link>
          </nav>
        </header>

        <main className="min-h-[calc(100vh-76px)]">
          {children}
        </main>
      </div>
    </div>
  );
}