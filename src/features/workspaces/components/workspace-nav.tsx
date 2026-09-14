"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type WorkspaceNavProps = {
  workspaceSlug: string;
};

const futureItems = ["Services", "Tickets", "Incidents"];

export function WorkspaceNav({
  workspaceSlug,
}: WorkspaceNavProps) {
  const pathname = usePathname();

  const items = [
    {
      label: "Overview",
      href: `/workspaces/${workspaceSlug}`,
      active: pathname === `/workspaces/${workspaceSlug}`,
    },
    {
      label: "Members",
      href: `/workspaces/${workspaceSlug}/members`,
      active: pathname.startsWith(
        `/workspaces/${workspaceSlug}/members`,
      ),
    },
  ];

  return (
    <nav className="border-b border-zinc-800">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`border-b-2 px-3 py-3 text-sm font-medium transition ${
              item.active
                ? "border-zinc-100 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {item.label}
          </Link>
        ))}

        {futureItems.map((item) => (
          <span
            key={item}
            className="cursor-not-allowed border-b-2 border-transparent px-3 py-3 text-sm font-medium text-zinc-700"
            title="Coming soon"
          >
            {item}
          </span>
        ))}
      </div>
    </nav>
  );
}
