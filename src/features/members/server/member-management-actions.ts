"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  removeMember,
  revokeInvitation,
  updateMemberRole,
} from "./member-management";

export type MemberActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const updateRoleSchema = z.object({
  workspaceId: z.string().min(1),
  workspaceSlug: z.string().min(1),
  membershipId: z.string().min(1),
  role: z.enum(["ADMIN", "AGENT", "VIEWER"]),
});

const removeMemberSchema = z.object({
  workspaceId: z.string().min(1),
  workspaceSlug: z.string().min(1),
  membershipId: z.string().min(1),
});

const revokeInvitationSchema = z.object({
  workspaceId: z.string().min(1),
  workspaceSlug: z.string().min(1),
  invitationId: z.string().min(1),
});

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

export async function updateMemberRoleAction(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const result = updateRoleSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    membershipId: formData.get("membershipId"),
    role: formData.get("role"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Invalid role change.",
    };
  }

  try {
    await updateMemberRole(result.data);

    revalidatePath(
      `/workspaces/${result.data.workspaceSlug}/members`,
    );

    return {
      status: "success",
      message: "Role updated.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}

export async function removeMemberAction(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const result = removeMemberSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    membershipId: formData.get("membershipId"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Invalid member removal.",
    };
  }

  try {
    await removeMember(result.data);

    revalidatePath(
      `/workspaces/${result.data.workspaceSlug}/members`,
    );

    return {
      status: "success",
      message: "Member removed.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}

export async function revokeInvitationAction(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const result = revokeInvitationSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    workspaceSlug: formData.get("workspaceSlug"),
    invitationId: formData.get("invitationId"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Invalid invitation.",
    };
  }

  try {
    await revokeInvitation(result.data);

    revalidatePath(
      `/workspaces/${result.data.workspaceSlug}/members`,
    );

    return {
      status: "success",
      message: "Invitation revoked.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
