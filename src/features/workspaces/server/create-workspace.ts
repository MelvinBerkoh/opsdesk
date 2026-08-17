"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/server/database/prisma";

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters.")
    .max(100, "Workspace name must be 100 characters or fewer."),
});

function createWorkspaceSlug(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const safeBase = base || "workspace";
  const suffix = crypto.randomUUID().slice(0, 6);

  return `${safeBase}-${suffix}`;
}

export async function createWorkspace(formData: FormData) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    throw new Error("You must be signed in to create a workspace.");
  }

  const result = createWorkspaceSchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    throw new Error(
      result.error.issues[0]?.message ?? "Invalid workspace name.",
    );
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: result.data.name,
      slug: createWorkspaceSlug(result.data.name),
      memberships: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    select: {
      slug: true,
    },
  });

  redirect(`/workspaces/${workspace.slug}`);
}
