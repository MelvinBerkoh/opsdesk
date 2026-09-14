"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { acceptInvitation } from "./accept-invitation";

/**
 * What this does: Connects the browser form to the secure acceptInvitation() logic we already built.
 *
 * Why: The client never creates memberships directly. 
 * The server validates the token, logged-in user, verified email, invitation state, and membership transaction before redirecting them into the workspace.
 */

const acceptInvitationActionSchema = z.object({
  token: z.string().min(20, "Invalid invitation token."),
});

export type AcceptInvitationActionState = {
  status: "idle" | "error";
  message: string;
};

export async function acceptInvitationAction(
  _previousState: AcceptInvitationActionState,
  formData: FormData,
): Promise<AcceptInvitationActionState> {
  const result = acceptInvitationActionSchema.safeParse({
    token: formData.get("token"),
  });

  if (!result.success) {
    return {
      status: "error",
      message:
        result.error.issues[0]?.message ?? "Unable to accept invitation.",
    };
  }

  let workspaceSlug: string;

  try {
    const accepted = await acceptInvitation({
      token: result.data.token,
    });

    workspaceSlug = accepted.workspace.slug;
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to accept invitation.",
    };
  }

  redirect(`/workspaces/${workspaceSlug}`);
}