import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { AcceptInvitationForm } from "@/features/invitations/components/accept-invitation-form";
import { getInvitationPreview } from "@/features/invitations/server/get-invitation-preview";

type InvitationPageProps = {
  params: Promise<{
    token: string;
  }>;
};

function InvalidInvitation({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          OpsDesk
        </p>

        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>

        <p className="mt-3 text-zinc-400">{message}</p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex text-sm font-medium text-zinc-200 hover:text-white"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}

export default async function InvitationPage({
  params,
}: InvitationPageProps) {
  const { token } = await params;

  const invitation = await getInvitationPreview(token);

  if (!invitation) {
    return (
      <InvalidInvitation
        title="Invalid invitation"
        message="This invitation link is not valid."
      />
    );
  }

  if (invitation.status === "REVOKED") {
    return (
      <InvalidInvitation
        title="Invitation revoked"
        message="This invitation is no longer available."
      />
    );
  }

  if (invitation.status === "ACCEPTED") {
    return (
      <InvalidInvitation
        title="Invitation already used"
        message="This invitation has already been accepted."
      />
    );
  }

  if (invitation.status === "EXPIRED") {
    return (
      <InvalidInvitation
        title="Invitation expired"
        message="Ask a workspace administrator to create a new invitation."
      />
    );
  }

  const { isAuthenticated } = await auth();

  const returnPath = `/invite/${token}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          OpsDesk Invitation
        </p>

        <h1 className="mt-3 text-2xl font-semibold">
          Join {invitation.workspace.name}
        </h1>

        <p className="mt-3 text-zinc-400">
          You have been invited to join this workspace.
        </p>

        <div className="mt-6 space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-zinc-500">Email</span>
            <span className="text-sm text-zinc-200">
              {invitation.email}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-sm text-zinc-500">Role</span>
            <span className="text-sm font-medium text-zinc-200">
              {invitation.role}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-sm text-zinc-500">Expires</span>
            <span className="text-sm text-zinc-200">
              {invitation.expiresAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {isAuthenticated ? (
          <AcceptInvitationForm token={token} />
        ) : (
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`}
            className="mt-6 flex w-full justify-center rounded-lg bg-zinc-100 px-4 py-2.5 font-medium text-zinc-950 transition hover:bg-white"
          >
            Sign in to accept
          </Link>
        )}
      </div>
    </main>
  );
}