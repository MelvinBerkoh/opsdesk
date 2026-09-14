"use server";

import { z } from "zod";

import { createInvitation } from "./create-invitation";

const actionSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["ADMIN", "AGENT", "VIEWER"]),
});

export type CreateInvitationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  invitePath?: string;
};

export async function createInvitationAction(
  _previousState: CreateInvitationActionState,
  formData: FormData,
): Promise<CreateInvitationActionState> {
  const parsed = actionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ?? "Unable to create invitation.",
    };
  }

  try {
    const invitation = await createInvitation(parsed.data);

    return {
      status: "success",
      message: `Invitation created for ${invitation.email}.`,
      invitePath: `/invite/${invitation.token}`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to create invitation.",
    };
  }
}
