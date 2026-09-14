export type WorkspaceRole =
  | "OWNER"
  | "ADMIN"
  | "AGENT"
  | "VIEWER";

export type WorkspacePermission =
  | "workspace:view"
  | "workspace:update"
  | "workspace:delete"
  | "members:view"
  | "members:invite"
  | "members:manage"
  | "services:view"
  | "services:manage"
  | "tickets:view"
  | "tickets:manage"
  | "incidents:view"
  | "incidents:manage"
  | "api-keys:manage"
  | "webhooks:manage"
  | "audit:view";

const permissionsByRole: Record<
  WorkspaceRole,
  ReadonlySet<WorkspacePermission>
> = {
  OWNER: new Set([
    "workspace:view",
    "workspace:update",
    "workspace:delete",
    "members:view",
    "members:invite",
    "members:manage",
    "services:view",
    "services:manage",
    "tickets:view",
    "tickets:manage",
    "incidents:view",
    "incidents:manage",
    "api-keys:manage",
    "webhooks:manage",
    "audit:view",
  ]),

  ADMIN: new Set([
    "workspace:view",
    "members:view",
    "members:invite",
    "members:manage",
    "services:view",
    "services:manage",
    "tickets:view",
    "tickets:manage",
    "incidents:view",
    "incidents:manage",
    "api-keys:manage",
    "webhooks:manage",
    "audit:view",
  ]),

  AGENT: new Set([
    "workspace:view",
    "members:view",
    "services:view",
    "tickets:view",
    "tickets:manage",
    "incidents:view",
    "incidents:manage",
  ]),

  VIEWER: new Set([
    "workspace:view",
    "members:view",
    "services:view",
    "tickets:view",
    "incidents:view",
  ]),
};

export class WorkspaceAuthorizationError extends Error {
  constructor() {
    super("You do not have permission to perform this action.");
    this.name = "WorkspaceAuthorizationError";
  }
}

export function hasWorkspacePermission(
  role: WorkspaceRole,
  permission: WorkspacePermission,
) {
  return permissionsByRole[role].has(permission);
}

export function assertWorkspacePermission(
  role: WorkspaceRole,
  permission: WorkspacePermission,
) {
  if (!hasWorkspacePermission(role, permission)) {
    throw new WorkspaceAuthorizationError();
  }
}
