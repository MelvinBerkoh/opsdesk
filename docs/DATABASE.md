# OpsDesk Database Design

OpsDesk uses PostgreSQL with Prisma.

The database is designed around one main rule:

> A resource ID is never enough to prove access. Tenant-owned data must also be tied to the correct workspace.

## 1. Current models

The deployed release uses these core models:

| Model | Purpose |
| --- | --- |
| Workspace | Tenant boundary |
| Membership | Connects a Clerk user to a workspace and role |
| Invitation | Pending workspace invite |
| Service | Product or system affected by work |
| Ticket | Support or operational issue |
| TicketActivity | History for a ticket |
| Incident | Escalated operational issue |
| IncidentActivity | History for an incident |

Future ideas such as comments, attachments, API keys, webhooks, and audit events are not part of the current schema.

## 2. Tenant boundary

`Workspace` is the main tenant.

Most business records include:

```text
workspaceId
```

Queries for tenant-owned data should include it.

Preferred:

```ts
where: {
  id: ticketId,
  workspaceId,
}
```

Avoid relying on:

```ts
where: {
  id: ticketId,
}
```

when the ID came from a request.

## 3. User identity

Authentication is handled by Clerk.

OpsDesk does not duplicate Clerk's authentication user record.

Instead, `Membership.userId` stores the Clerk user identifier.

```text
Clerk user
    |
    v
Membership
    |
    v
Workspace
```

This keeps authentication separate from application authorization.

## 4. Workspace

Important fields:

```text
id
name
slug
ticketSequence
incidentSequence
createdAt
updatedAt
```

The workspace stores the next human-readable ticket and incident numbers.

Sequence increments happen inside transactions.

## 5. Membership

Important fields:

```text
id
workspaceId
userId
role
joinedAt
removedAt
createdAt
updatedAt
```

Current roles:

```text
OWNER
ADMIN
AGENT
VIEWER
```

A user can belong to many workspaces but only once per workspace.

```text
UNIQUE(workspaceId, userId)
```

Removed memberships keep historical relationships through `removedAt` instead of being deleted immediately.

## 6. Invitation

Important fields:

```text
id
workspaceId
email
role
tokenHash
invitedByMembershipId
expiresAt
acceptedAt
revokedAt
createdAt
updatedAt
```

The raw invitation token is not stored.

The database stores a hash of the token.

## 7. Service

A service is something that tickets or incidents can affect.

Examples:

```text
Payments API
Authentication
Checkout
Customer Dashboard
```

Important fields:

```text
id
workspaceId
name
slug
description
archivedAt
createdAt
updatedAt
```

Service slugs are unique inside a workspace.

Archived services remain useful for old records but are not normally selected for new work.

## 8. Ticket

Important fields:

```text
id
workspaceId
number
title
description
priority
status
serviceId
reporterMembershipId
assigneeMembershipId

responseDeadline
resolutionDeadline
firstResponseAt
resolvedAt
closedAt

responseWarningAt
resolutionWarningAt
responseBreachedAt
resolutionBreachedAt

createdAt
updatedAt
```

Ticket numbers are unique inside a workspace:

```text
UNIQUE(workspaceId, number)
```

Displayed numbers such as `TKT-0042` are presentation values. The stored numeric value is still an integer.

### Ticket statuses

```text
OPEN
IN_PROGRESS
WAITING
RESOLVED
CLOSED
```

### Priority

```text
P0
P1
P2
P3
```

## 9. Ticket activity

Ticket activity stores important changes separately from the ticket itself.

Important fields:

```text
id
workspaceId
ticketId
actorMembershipId
type
metadata
createdAt
```

Current activity types include:

```text
CREATED
STATUS_CHANGED
PRIORITY_CHANGED
ASSIGNEE_CHANGED
SERVICE_CHANGED
COMMENT_ADDED
SLA_WARNING
SLA_BREACHED
RESOLVED
CLOSED
REOPENED
INCIDENT_LINKED
```

`actorMembershipId` may be null for system-generated events such as SLA warnings and breaches.

`metadata` is JSON and stores event-specific details such as:

```json
{
  "from": "OPEN",
  "to": "IN_PROGRESS"
}
```

## 10. Incident

Important fields:

```text
id
workspaceId
number
title
description
priority
status
serviceId
ownerMembershipId
sourceTicketId
resolvedAt
createdAt
updatedAt
```

Incident numbers are unique inside a workspace.

The current release supports a direct ticket-to-incident escalation relationship through `sourceTicketId`.

### Incident statuses

```text
OPEN
INVESTIGATING
MONITORING
RESOLVED
```

## 11. Incident activity

Incident activity follows the same basic pattern as ticket activity.

It records changes such as:

```text
CREATED
STATUS_CHANGED
PRIORITY_CHANGED
OWNER_CHANGED
SERVICE_CHANGED
TICKET_LINKED
RESOLVED
REOPENED
```

## 12. SLA fields

The current SLA engine stores deadline snapshots directly on the ticket.

That matters because a ticket should keep the target it was working against instead of depending only on a policy that could later change.

State timestamps also make warning and breach writes idempotent:

```text
responseWarningAt
resolutionWarningAt
responseBreachedAt
resolutionBreachedAt
```

A normal breach condition looks like:

```text
deadline passed
AND
breachedAt is null
```

The app then performs a conditional update before creating the activity event.

## 13. Relationships

Simplified view:

```text
Workspace
├── Memberships
├── Invitations
├── Services
├── Tickets
│   └── TicketActivity
└── Incidents
    └── IncidentActivity

Ticket
└── optional escalated Incident
```

Tickets and incidents may reference a service and an active workspace member.

Application logic checks that those related records belong to the same workspace.

## 14. Delete strategy

OpsDesk avoids deleting history when a timestamp can preserve it.

Examples:

```text
Membership -> removedAt
Service    -> archivedAt
```

Historical ticket and incident activity remains available.

## 15. Indexing

Useful indexes follow common workspace-scoped queries.

Examples:

```text
(workspaceId, status)
(workspaceId, priority)
(workspaceId, assigneeMembershipId)
(workspaceId, ticketId, createdAt)
```

Indexes should support real query patterns rather than exist only because a column looks important.

## 16. Migrations

Prisma migrations are kept focused by feature.

The current schema grew in stages such as:

```text
workspace foundation
invitations
services
tickets
incidents
```

Production uses normal forward migrations. Destructive schema changes should be reviewed before deployment.

## 17. Source of truth

PostgreSQL is the source of truth for business state.

UI state, Clerk sessions, and any future cache or job system must not become separate authoritative copies of ticket or incident data.

## 18. Future schema ideas

Possible future additions:

```text
TicketComment
IncidentComment
TicketAttachment
IncidentAttachment
SlaPolicy
SlaTarget
ApiKey
WebhookEndpoint
WebhookDelivery
AuditEvent
```

These belong in the schema only when the product actually implements the related feature.
