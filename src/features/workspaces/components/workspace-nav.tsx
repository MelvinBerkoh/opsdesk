"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type WorkspaceNavProps = {
  workspaceSlug: string;
};

export function WorkspaceNav({
  workspaceSlug,
}: WorkspaceNavProps) {
  const pathname = usePathname();

  const items = [
    {
      label: "Overview",
      short: "01",
      href: `/workspaces/${workspaceSlug}`,
      active: pathname === `/workspaces/${workspaceSlug}`,
    },
    {
      label: "Members",
      short: "02",
      href: `/workspaces/${workspaceSlug}/members`,
      active: pathname.startsWith(
        `/workspaces/${workspaceSlug}/members`,
      ),
    },
    {
      label: "Services",
      short: "03",
      href: `/workspaces/${workspaceSlug}/services`,
      active: pathname.startsWith(
        `/workspaces/${workspaceSlug}/services`,
      ),
    },
    {
      label: "Tickets",
      short: "04",
      href: `/workspaces/${workspaceSlug}/tickets`,
      active: pathname.startsWith(
        `/workspaces/${workspaceSlug}/tickets`,
      ),
    },
    {
      label: "Incidents",
      short: "05",
      href: `/workspaces/${workspaceSlug}/incidents`,
      active: pathname.startsWith(
        `/workspaces/${workspaceSlug}/incidents`,
      ),
    },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090d]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <div className="hidden items-center gap-3 border-r border-white/10 pr-5 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 font-mono text-xs font-bold text-cyan-300">
            OD
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
              Control
            </p>

            <p className="text-xs font-medium text-zinc-300">
              Workspace
            </p>
          </div>
        </div>

        <nav className="flex flex-1 gap-1 overflow-x-auto">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`group relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                item.active
                  ? "bg-white/[0.07] text-white"
                  : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
              }`}
            >
              <span
                className={`font-mono text-[10px] ${
                  item.active
                    ? "text-cyan-300"
                    : "text-zinc-700 group-hover:text-zinc-500"
                }`}
              >
                {item.short}
              </span>

              <span>{item.label}</span>

              {item.active && (
                <span className="absolute inset-x-3 -bottom-3 h-px bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-400 lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>

          Live
        </div>
      </div>
    </div>
  );
}