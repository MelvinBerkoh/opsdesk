import { describe, expect, it } from "vitest";

import {
  assertWorkspacePermission,
  hasWorkspacePermission,
  WorkspaceAuthorizationError,
} from "./workspace-permissions";

describe("workspace permissions", () => {
  it("gives owners full workspace control", () => {
    expect(hasWorkspacePermission("OWNER", "workspace:delete")).toBe(true);
    expect(hasWorkspacePermission("OWNER", "members:manage")).toBe(true);
    expect(hasWorkspacePermission("OWNER", "webhooks:manage")).toBe(true);
  });

  it("allows admins to manage members and integrations without owner-only workspace control", () => {
    expect(hasWorkspacePermission("ADMIN", "members:invite")).toBe(true);
    expect(hasWorkspacePermission("ADMIN", "members:manage")).toBe(true);
    expect(hasWorkspacePermission("ADMIN", "api-keys:manage")).toBe(true);
    expect(hasWorkspacePermission("ADMIN", "audit:view")).toBe(true);

    expect(hasWorkspacePermission("ADMIN", "workspace:update")).toBe(false);
    expect(hasWorkspacePermission("ADMIN", "workspace:delete")).toBe(false);
  });

  it("allows agents to work tickets and incidents without administrative access", () => {
    expect(hasWorkspacePermission("AGENT", "tickets:manage")).toBe(true);
    expect(hasWorkspacePermission("AGENT", "incidents:manage")).toBe(true);

    expect(hasWorkspacePermission("AGENT", "members:invite")).toBe(false);
    expect(hasWorkspacePermission("AGENT", "api-keys:manage")).toBe(false);
    expect(hasWorkspacePermission("AGENT", "audit:view")).toBe(false);
  });

  it("keeps viewers read-only", () => {
    expect(hasWorkspacePermission("VIEWER", "workspace:view")).toBe(true);
    expect(hasWorkspacePermission("VIEWER", "services:view")).toBe(true);
    expect(hasWorkspacePermission("VIEWER", "tickets:view")).toBe(true);
    expect(hasWorkspacePermission("VIEWER", "incidents:view")).toBe(true);

    expect(hasWorkspacePermission("VIEWER", "tickets:manage")).toBe(false);
    expect(hasWorkspacePermission("VIEWER", "incidents:manage")).toBe(false);
    expect(hasWorkspacePermission("VIEWER", "members:invite")).toBe(false);
  });

  it("throws a consistent authorization error when permission is denied", () => {
    expect(() =>
      assertWorkspacePermission("VIEWER", "members:manage"),
    ).toThrow(WorkspaceAuthorizationError);
  });

  it("does not throw when permission is allowed", () => {
    expect(() =>
      assertWorkspacePermission("OWNER", "members:manage"),
    ).not.toThrow();
  });
});
