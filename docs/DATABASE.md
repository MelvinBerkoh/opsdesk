# OpsDesk Database Design

## Document Status

- **Version:** 0.1
- **Status:** Initial Database Design
- **Product:** OpsDesk
- **Database:** PostgreSQL
- **ORM:** Prisma

---

## 1. Database Goals

The OpsDesk database must support:

- secure multi-tenancy
- workspace memberships
- role-based access control
- workspace invitations
- services
- tickets
- incidents
- ticket-to-incident relationships
- comments
- activity timelines
- SLA policies and deadlines
- attachments
- API keys
- outbound webhooks
- webhook delivery history
- immutable audit events
- background processing
- full-text search
- human-readable issue numbers

PostgreSQL is the authoritative source of business state.

Redis, queues, real-time messages, and object storage must not become independent sources of truth for relational business data.

---

## 2. Core Tenant Boundary

`Workspace` is the primary tenant boundary.

Most business records belong directly to a workspace.

Conceptually:

```text
Workspace
│
├── Memberships
├── Invitations
├── Services
├── Tickets
├── Incidents
├── SLA Policies
├── API Keys
├── Webhook Endpoints
└── Audit Events
```

Every tenant-owned query must prove workspace ownership.

Unsafe:

```ts
where: {
  id: incidentId,
}
```

Preferred:

```ts
where: {
  id: incidentId,
  workspaceId,
}
```

A resource identifier is never proof that the requesting user may access the resource.

---

## 3. External User Identity

Authentication is handled by Clerk.

OpsDesk will not initially maintain a duplicate authentication `User` table.

Instead, workspace memberships store the authenticated Clerk user identifier.

Example:

```text
Membership.userId = Clerk user ID
```

This keeps authentication identity separate from application authorization.

If OpsDesk later requires durable user profile information independent of Clerk, a local user/profile model may be introduced deliberately.

---

## 4. Entity Relationship Overview

```text
                         Clerk User
                             │
                             │ userId
                             ▼
                    ┌─────────────────┐
                    │   Membership    │
                    └────────┬────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                       Workspace                          │
└────────┬─────────┬──────────┬──────────┬────────────────┘
         │         │          │          │
         ▼         ▼          ▼          ▼
     Service     Ticket    Incident   SLA Policy
                   │          │
                   │          │
                   ▼          ▼
              Ticket      Incident
              Comments    Comments
                   │          │
                   ▼          ▼
              Ticket      Incident
              Activity    Activity

Workspace
   │
   ├── Invitations
   ├── API Keys
   ├── Webhook Endpoints
   │        │
   │        └── Webhook Deliveries
   │
   └── Audit Events

Ticket ───── TicketIncidentLink ───── Incident
```

---

## 5. Workspace

A workspace represents one tenant.

Examples:

- Acme Corp
- Internal IT
- Engineering
- Example Startup

Target fields:

```text
id
name
slug
ticketSequence
incidentSequence
createdAt
updatedAt
```

### Constraints

- `slug` must be globally unique.
- Workspace IDs should use non-sequential application-friendly IDs.
- Human-readable ticket and incident numbers are generated separately.

### Sequence Fields

`ticketSequence` and `incidentSequence` track the next human-readable number allocated inside the workspace.

Example:

```text
Workspace A
ticketSequence = 1042
incidentSequence = 184
```

The application can produce:

```text
TKT-1042
INC-0184
```

Sequence allocation must be atomic to prevent duplicate numbers during concurrent issue creation.

---

## 6. Membership

A membership connects an authenticated user to a workspace.

Target fields:

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

### Role Enum

```text
OWNER
ADMIN
AGENT
VIEWER
```

### Constraints

A user may belong to many workspaces.

A user should have at most one membership record per workspace:

```text
UNIQUE(workspaceId, userId)
```

### Soft Removal

Membership records should not normally be hard-deleted.

Instead:

```text
removedAt = timestamp
```

This preserves historical relationships such as:

- who created an incident
- who posted a comment
- who changed a role
- who performed an audited action

A removed member no longer has authorization.

If invited again later, the existing membership may be reactivated rather than creating conflicting historical identities.

---

## 7. Workspace Ownership

Each workspace must always have an Owner.

Initial rules:

- workspace creator becomes Owner
- only Owner may delete workspace
- Admin cannot demote Owner
- Admin cannot remove Owner
- transferring ownership must be explicit
- normal member removal must not leave the workspace without an Owner

These rules are business rules enforced server-side.

Database constraints alone are not sufficient to enforce every ownership transition.

---

## 8. Invitation

Invitations allow Owners and Admins to invite new workspace members.

Target fields:

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

### Security

The raw invitation token must not be stored.

Store:

```text
hash(token)
```

instead of:

```text
token
```

The raw token is delivered to the invitee.

When the link is used, the submitted token is verified against the stored hash.

### Invitation States

Invitation state is derived from timestamps.

Examples:

```text
Pending:
acceptedAt = null
revokedAt = null
expiresAt > now

Accepted:
acceptedAt != null

Revoked:
revokedAt != null

Expired:
expiresAt <= now
```

### Email Handling

Email addresses should be normalized before comparison.

For example:

```text
Melvin@Example.com

becomes

melvin@example.com
```

Exact normalization rules will be implemented carefully rather than relying solely on display casing.

---

## 9. Service

A Service represents a system that tickets or incidents affect.

Examples:

```text
Payments API
Authentication
Checkout
Customer Dashboard
Email Delivery
```

Target fields:

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

### Constraints

Service slugs should be unique within a workspace:

```text
UNIQUE(workspaceId, slug)
```

Archived services remain available for historical issues but cannot normally be selected for new issues.

---

## 10. Priority

Tickets and incidents use the same initial priority scale.

Enum:

```text
P0
P1
P2
P3
```

Meaning:

```text
P0 = Critical
P1 = High
P2 = Medium
P3 = Low
```

The label shown to users is separate from the stored enum value.

---

## 11. Ticket

A Ticket represents a support request or operational issue that does not initially require a full incident response.

Target fields:

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
slaPolicyId
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

### Ticket Status Enum

```text
OPEN
IN_PROGRESS
WAITING
RESOLVED
CLOSED
```

### Constraints

Ticket numbers must be unique inside a workspace:

```text
UNIQUE(workspaceId, number)
```

### Reporter

`reporterMembershipId` identifies the workspace member who created the ticket.

For the initial version, every ticket is created by an authenticated workspace member.

External customer identities may be introduced later.

### Assignee

`assigneeMembershipId` is optional.

If provided, the assignee must belong to the same workspace as the ticket.

Application logic must enforce that rule.

---

## 12. Incident

An Incident represents a higher-severity operational problem requiring coordinated response.

Target fields:

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
slaPolicyId
responseDeadline
resolutionDeadline
acknowledgedAt
resolvedAt
responseWarningAt
resolutionWarningAt
responseBreachedAt
resolutionBreachedAt
createdAt
updatedAt
```

### Incident Status Enum

```text
OPEN
INVESTIGATING
MONITORING
RESOLVED
```

### Constraints

Incident numbers must be unique within a workspace:

```text
UNIQUE(workspaceId, number)
```

---

## 13. Internal IDs vs Display Numbers

Tickets and incidents have two identifiers.

Example:

```text
Internal database ID:
cmabc123xyz

Human-readable number:
184
```

Displayed to the user as:

```text
INC-0184
```

or:

```text
TKT-1042
```

The numeric portion is stored as an integer.

The prefix and zero-padding are presentation concerns.

Internal IDs remain the primary keys used for database relationships.

---

## 14. Ticket to Incident Relationship

A support ticket may later be associated with an incident.

Multiple tickets may refer to the same underlying incident.

Likewise, an incident may have several related tickets.

Therefore OpsDesk should use a join table rather than a single nullable foreign key.

Target model:

```text
TicketIncidentLink
```

Fields:

```text
id
workspaceId
ticketId
incidentId
linkedByMembershipId
createdAt
```

Constraint:

```text
UNIQUE(ticketId, incidentId)
```

All three resources must belong to the same workspace:

```text
link.workspaceId
ticket.workspaceId
incident.workspaceId
```

Application logic must validate this invariant before creating the link.

---

## 15. Ticket Comment

Ticket comments are stored separately from incident comments.

Target fields:

```text
id
workspaceId
ticketId
authorMembershipId
body
editedAt
createdAt
updatedAt
```

Why a dedicated table?

It preserves real foreign-key relationships.

A generic polymorphic table such as:

```text
targetType
targetId
```

would be more flexible but would lose straightforward database-level referential integrity.

For the initial system, explicit tables are preferred.

---

## 16. Incident Comment

Target fields:

```text
id
workspaceId
incidentId
authorMembershipId
body
editedAt
createdAt
updatedAt
```

Incident comments should be ordered chronologically.

Indexes should support:

```text
(workspaceId, incidentId, createdAt)
```

Real-time delivery changes how clients receive comments.

It does not change how comments are permanently stored.

---

## 17. Comment Deletion

The initial implementation should avoid silently destroying investigation history.

Possible strategy:

```text
deletedAt
```

rather than immediately removing a comment.

Whether members may delete their own comments will be determined during implementation.

If soft deletion is introduced, the application can render:

```text
Comment deleted
```

while preserving timeline ordering and auditability.

---

## 18. Ticket Activity

Ticket activity records business events affecting a ticket.

Target fields:

```text
id
workspaceId
ticketId
actorMembershipId
type
metadata
createdAt
```

Potential activity types:

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

`metadata` may use PostgreSQL JSON for event-specific details.

Example:

```json
{
  "from": "OPEN",
  "to": "IN_PROGRESS"
}
```

Activity events are append-only through normal product flows.

---

## 19. Incident Activity

Target fields:

```text
id
workspaceId
incidentId
actorMembershipId
type
metadata
createdAt
```

Potential types:

```text
CREATED
STATUS_CHANGED
PRIORITY_CHANGED
ASSIGNEE_CHANGED
SERVICE_CHANGED
COMMENT_ADDED
SLA_WARNING
SLA_BREACHED
ACKNOWLEDGED
RESOLVED
REOPENED
TICKET_LINKED
```

System-generated events may have:

```text
actorMembershipId = null
```

Example:

```text
SLA resolution target breached automatically
```

---

## 20. Activity vs Audit

Activity and audit events serve different purposes.

### Activity

Answers:

> What happened to this ticket or incident?

Examples:

```text
Incident moved to Investigating
Priority changed from P2 to P1
Melvin added a comment
Incident resolved
```

### Audit

Answers:

> Who performed a security-sensitive workspace action?

Examples:

```text
Admin invited a member
Owner changed a member role
API key created
Webhook endpoint deleted
```

These systems should remain separate.

---

## 21. SLA Policy

A workspace may define one or more SLA policies.

Target fields:

```text
id
workspaceId
name
description
isDefault
archivedAt
createdAt
updatedAt
```

Example:

```text
Default Support SLA
Enterprise SLA
Internal Operations SLA
```

Only one active policy should normally be considered the workspace default.

Enforcing that invariant may require application logic or a PostgreSQL partial unique index.

---

## 22. SLA Target

SLA timing varies by priority.

Instead of placing all priority timings directly on `SlaPolicy`, use child target records.

Target fields:

```text
id
slaPolicyId
priority
responseMinutes
resolutionMinutes
createdAt
updatedAt
```

Constraint:

```text
UNIQUE(slaPolicyId, priority)
```

Example:

```text
Default Support SLA

P0
responseMinutes = 15
resolutionMinutes = 60

P1
responseMinutes = 60
resolutionMinutes = 240

P2
responseMinutes = 240
resolutionMinutes = 1440

P3
responseMinutes = 1440
resolutionMinutes = 4320
```

The initial implementation uses elapsed minutes.

Business-hours calendars and holiday schedules are deliberately excluded from the first SLA version because they significantly increase scheduling complexity.

They may be added later.

---

## 23. SLA Historical Stability

Changing an SLA policy should not silently rewrite the history of existing tickets or incidents.

Therefore, when an issue is created, OpsDesk stores calculated deadline snapshots directly on the issue:

```text
responseDeadline
resolutionDeadline
```

The issue may also retain:

```text
slaPolicyId
```

for traceability.

If the policy changes later, existing issue deadlines remain unchanged unless an explicit business operation recalculates them.

This prevents historical deadlines from changing unexpectedly.

---

## 24. SLA State Fields

Tickets and incidents may store timestamps such as:

```text
responseWarningAt
resolutionWarningAt
responseBreachedAt
resolutionBreachedAt
```

These fields serve multiple purposes:

- display
- reporting
- worker idempotency
- preventing duplicate warning events
- preventing duplicate breach events

Example worker logic:

```text
resolutionDeadline has passed
AND
resolutionBreachedAt is null
AND
issue is not resolved
```

Then:

```text
set resolutionBreachedAt
create activity event
queue webhook event
```

---

## 25. SLA Acknowledgement

For incidents:

```text
acknowledgedAt
```

represents the first explicit acknowledgement of the incident.

For tickets:

```text
firstResponseAt
```

represents the first qualifying response.

The precise business action that counts as a response will be defined during the SLA implementation phase.

The database stores the resulting timestamp.

---

## 26. Ticket Attachment

Ticket file metadata should be stored in PostgreSQL.

The file itself belongs in object storage.

Target fields:

```text
id
workspaceId
ticketId
uploadedByMembershipId
fileName
mimeType
sizeBytes
storageKey
createdAt
```

The actual file is not stored in PostgreSQL.

---

## 27. Incident Attachment

Target fields:

```text
id
workspaceId
incidentId
uploadedByMembershipId
fileName
mimeType
sizeBytes
storageKey
createdAt
```

Separate ticket and incident attachment tables preserve explicit foreign keys.

A generic polymorphic attachment table is intentionally avoided initially.

---

## 28. Object Storage Keys

Storage keys should not expose sensitive business information unnecessarily.

Prefer identifiers:

```text
workspaces/ws_123/incidents/inc_456/attachments/att_789
```

instead of user-controlled paths such as:

```text
Acme Company/Production Outage/passwords.txt
```

Original display filenames remain metadata.

Storage keys are not authorization credentials.

---

## 29. API Key

Workspace API keys allow external systems to access `/api/v1`.

Target fields:

```text
id
workspaceId
name
prefix
secretHash
scopes
createdByMembershipId
lastUsedAt
expiresAt
revokedAt
createdAt
updatedAt
```

### Secret Storage

Suppose the generated key is:

```text
ops_live_abcdef123456...
```

The system may store:

```text
prefix = ops_live_abcd
secretHash = <secure hash>
```

It must not store:

```text
ops_live_abcdef123456...
```

The raw key is shown once during creation.

---

## 30. API Key Lookup

The prefix provides an efficient way to find candidate credentials.

Conceptual authentication:

```text
Presented key
     │
     ▼
Extract prefix
     │
     ▼
Find candidate key
     │
     ▼
Verify secret against stored hash
     │
     ▼
Check revoked / expired
     │
     ▼
Resolve workspace
```

A prefix itself is not secret and does not authenticate a request.

---

## 31. API Key Scopes

API keys should not necessarily receive unlimited workspace access.

Potential initial scopes:

```text
incidents:read
incidents:write
tickets:read
tickets:write
services:read
```

Scopes may initially be stored as a PostgreSQL array.

Exact permission behavior will be defined with the API implementation.

Workspace authorization still applies even after a key is authenticated.

---

## 32. Webhook Endpoint

A webhook endpoint represents an external destination registered by a workspace.

Target fields:

```text
id
workspaceId
name
url
eventTypes
secretCiphertext
secretIv
createdByMembershipId
disabledAt
createdAt
updatedAt
```

### Why the Webhook Secret Is Different From an API Key

API key secrets only need to be verified.

Therefore API key secrets can be hashed.

Webhook signing secrets must later be retrieved so OpsDesk can generate an HMAC signature.

Therefore webhook signing secrets cannot simply be one-way hashed.

They must instead be securely encrypted at rest using an application encryption key stored outside the database.

---

## 33. Webhook Event Types

A webhook may subscribe to selected event types.

Examples:

```text
incident.created
incident.updated
incident.resolved
ticket.created
ticket.updated
sla.warning
sla.breached
```

Event subscriptions may initially be represented as a PostgreSQL array.

If subscriptions become significantly more complex, they can later move into a dedicated relation.

---

## 34. Webhook Delivery

Every outbound delivery attempt needs durable state.

Target fields:

```text
id
workspaceId
webhookEndpointId
eventId
eventType
payload
status
attemptCount
responseStatus
lastError
nextAttemptAt
deliveredAt
createdAt
updatedAt
```

### Delivery Status Enum

```text
PENDING
PROCESSING
DELIVERED
FAILED
```

### Payload

`payload` may use PostgreSQL JSON.

The delivery record preserves the exact event payload intended for that delivery rather than rebuilding it later from mutable business state.

---

## 35. Webhook Retry Safety

The queue may deliver a job more than once.

The database delivery record acts as the durable source of delivery state.

Worker logic should check:

```text
delivery.status
```

before sending.

A job that sees:

```text
DELIVERED
```

should stop rather than send again.

External systems should also receive a stable delivery identifier that they may use for their own idempotency.

---

## 36. Audit Event

Audit events represent security-sensitive workspace history.

Target fields:

```text
id
workspaceId
actorMembershipId
eventType
targetType
targetId
metadata
createdAt
```

Examples:

```text
WORKSPACE_CREATED
WORKSPACE_UPDATED
MEMBER_INVITED
INVITATION_REVOKED
MEMBER_JOINED
MEMBER_ROLE_CHANGED
MEMBER_REMOVED
SERVICE_CREATED
SERVICE_ARCHIVED
API_KEY_CREATED
API_KEY_REVOKED
WEBHOOK_CREATED
WEBHOOK_UPDATED
WEBHOOK_DELETED
```

Audit events are append-only through normal application behavior.

---

## 37. Audit Actor Preservation

Because membership rows are soft-removed rather than deleted, historical audit entries can continue referencing the actor membership.

For truly system-generated events:

```text
actorMembershipId = null
```

The audit metadata may contain a safe snapshot of relevant historical display information if needed.

Secrets must never be copied into audit metadata.

---

## 38. Background Job Persistence

BullMQ will store queue state in Redis.

Normal queue jobs do not require a PostgreSQL row merely because they exist.

However, business operations whose history matters should have durable relational state.

Examples:

```text
Webhook delivery
→ PostgreSQL WebhookDelivery row

SLA breach
→ issue breach timestamp + activity event
```

Redis queue history alone is not sufficient for product-level auditing.

---

## 39. Optional Transactional Outbox

Some future workflows may require stronger guarantees that a successful database change always results in an asynchronous event.

Potential model:

```text
OutboxEvent
```

Fields:

```text
id
workspaceId
eventType
aggregateType
aggregateId
payload
processedAt
createdAt
```

Example transaction:

```text
BEGIN

update incident

insert incident activity

insert outbox event

COMMIT
```

A publisher later reads unprocessed outbox records and publishes them to Redis.

The outbox pattern should not be introduced everywhere on day one.

It will be added where event-loss risk justifies the additional complexity.

---

## 40. Idempotency Keys

The public API may eventually support idempotency keys for creation endpoints.

Potential model:

```text
ApiIdempotencyKey
```

Fields:

```text
id
workspaceId
apiKeyId
key
requestHash
responseStatus
responseBody
expiresAt
createdAt
```

This would allow a client to safely retry operations such as:

```text
POST /api/v1/incidents
```

without accidentally creating duplicate incidents.

This is a later API-phase enhancement rather than part of the initial database migration.

---

## 41. Time Storage

All database timestamps are stored in UTC.

Examples:

```text
createdAt
updatedAt
expiresAt
resolvedAt
responseDeadline
resolutionDeadline
```

Browser time is not authoritative.

Server-side time determines:

- expiration
- SLA deadlines
- webhook timestamps
- audit timestamps
- invitation validity

---

## 42. Created and Updated Timestamps

Mutable records should generally contain:

```text
createdAt
updatedAt
```

Append-only event tables may only require:

```text
createdAt
```

Examples of append-only tables:

```text
TicketActivity
IncidentActivity
AuditEvent
```

---

## 43. Soft Delete vs Hard Delete

Deletion strategy depends on the type of data.

### Membership

Soft-remove using:

```text
removedAt
```

### Service

Archive using:

```text
archivedAt
```

### API Key

Revoke using:

```text
revokedAt
```

### Webhook Endpoint

Disable or delete according to product behavior while preserving delivery history.

### Ticket / Incident

Prefer preserving operational history.

Archiving or other non-destructive behavior may be introduced rather than routine hard deletion.

### Audit Event

No normal deletion.

### Workspace

Workspace deletion is a special destructive operation requiring explicit Owner confirmation.

---

## 44. Foreign Key Delete Behavior

Foreign-key deletion behavior must be deliberate.

Avoid broad use of:

```text
ON DELETE CASCADE
```

without considering historical consequences.

For example, deleting a membership should not erase:

- comments
- incident activity
- audit events

This is another reason membership removal is modeled as soft removal.

Workspace destruction is different.

If an Owner explicitly deletes an entire workspace, tenant-owned records may eventually cascade as one destructive operation after confirmation.

Exact Prisma referential actions will be reviewed model by model during schema implementation.

---

## 45. Workspace Consistency

Many records include `workspaceId` even when their parent relation already indirectly reveals the workspace.

Example:

```text
IncidentComment
├── workspaceId
└── incidentId
```

This intentional duplication provides:

- simpler tenant-scoped queries
- useful composite indexes
- explicit ownership
- defense-in-depth

However, it creates an invariant:

```text
comment.workspaceId == incident.workspaceId
```

Server operations must preserve this invariant.

Where appropriate, composite database relationships may later strengthen this guarantee.

---

## 46. Cross-Workspace Relationship Rules

OpsDesk must reject relationships such as:

```text
Workspace A incident
assigned to
Workspace B member
```

or:

```text
Workspace A ticket
linked to
Workspace B incident
```

or:

```text
Workspace A webhook delivery
sent using
Workspace B endpoint
```

These are authorization and integrity failures.

Tests must explicitly attempt cross-workspace relationships.

---

## 47. Indexing Strategy

Most operational queries begin with:

```text
workspaceId
```

Therefore important indexes should normally start with the workspace identifier.

Potential ticket indexes:

```text
(workspaceId, status)
(workspaceId, priority)
(workspaceId, assigneeMembershipId)
(workspaceId, serviceId)
(workspaceId, createdAt)
(workspaceId, updatedAt)
```

Potential incident indexes:

```text
(workspaceId, status)
(workspaceId, priority)
(workspaceId, assigneeMembershipId)
(workspaceId, serviceId)
(workspaceId, responseDeadline)
(workspaceId, resolutionDeadline)
(workspaceId, updatedAt)
```

Actual indexes should reflect real query patterns rather than blindly indexing every column.

---

## 48. Activity Indexes

Timeline queries should support efficient chronological retrieval.

Examples:

```text
(workspaceId, ticketId, createdAt)
(workspaceId, incidentId, createdAt)
```

Pagination should avoid loading an unlimited activity history.

---

## 49. Invitation Indexes

Likely indexes include:

```text
workspaceId
email
expiresAt
tokenHash
```

`tokenHash` should be unique.

Pending invitation lookup may use combinations of:

```text
workspaceId
email
acceptedAt
revokedAt
```

---

## 50. API Key Indexes

Likely indexes include:

```text
workspaceId
prefix
revokedAt
```

The secret hash should not need broad scanning.

Prefix-based candidate lookup should dramatically reduce credential verification work.

---

## 51. Webhook Delivery Indexes

Worker and dashboard queries may require:

```text
(webhookEndpointId, createdAt)
(workspaceId, status)
(status, nextAttemptAt)
(eventId)
```

Final indexes will depend on queue and retry implementation.

---

## 52. Search

Initial full-text search should remain inside PostgreSQL.

Searchable content:

```text
Ticket.title
Ticket.description
Incident.title
Incident.description
TicketComment.body
IncidentComment.body
Service.name
```

PostgreSQL full-text search indexes may be introduced using raw SQL migrations where Prisma schema syntax is insufficient.

Search queries must always remain workspace-scoped.

---

## 53. Pagination

Large collections should be paginated.

Examples:

- tickets
- incidents
- activity events
- comments
- audit events
- webhook deliveries

Cursor-based pagination is preferred where stable ordering and scale justify it.

Example order:

```text
updatedAt DESC
id DESC
```

Offset pagination may still be acceptable for smaller administrative lists.

---

## 54. Transactions

Multi-record business changes should be transactional when the records represent one logical operation.

Example:

```text
Create incident
      +
Allocate incident number
      +
Create initial activity event
```

These should not leave partially completed state.

Another example:

```text
Resolve incident
      +
Set resolvedAt
      +
Create resolution activity
      +
Mark relevant SLA state
```

External HTTP calls must not be performed inside a database transaction.

---

## 55. Human-Readable Number Allocation

Issue sequence allocation must survive concurrent requests.

Conceptually:

```text
BEGIN

atomically increment workspace.incidentSequence

read resulting value

create incident using resulting number

COMMIT
```

Two simultaneous requests must never receive the same number.

The exact Prisma/PostgreSQL implementation will be tested for concurrency safety.

---

## 56. Validation Layers

OpsDesk uses multiple integrity layers.

### Zod

Validates untrusted application input.

### Authorization Layer

Ensures the authenticated actor may perform the operation.

### Domain Logic

Enforces business rules such as legal status transitions.

### Prisma

Provides typed database access.

### PostgreSQL Constraints

Protect:

- uniqueness
- required fields
- foreign keys
- relational integrity

No single layer replaces the others.

---

## 57. Expected Initial Enums

The initial Prisma schema will likely include enums equivalent to:

```text
WorkspaceRole
OWNER
ADMIN
AGENT
VIEWER
```

```text
Priority
P0
P1
P2
P3
```

```text
TicketStatus
OPEN
IN_PROGRESS
WAITING
RESOLVED
CLOSED
```

```text
IncidentStatus
OPEN
INVESTIGATING
MONITORING
RESOLVED
```

```text
WebhookDeliveryStatus
PENDING
PROCESSING
DELIVERED
FAILED
```

Activity event enums may also be introduced.

Exact enum names may evolve while implementing the schema.

---

## 58. Expected Initial Core Models

The database foundation should eventually contain models equivalent to:

```text
Workspace
Membership
Invitation
Service

Ticket
TicketComment
TicketActivity

Incident
IncidentComment
IncidentActivity

TicketIncidentLink

SlaPolicy
SlaTarget

TicketAttachment
IncidentAttachment

ApiKey

WebhookEndpoint
WebhookDelivery

AuditEvent
```

Not every model must be introduced in the very first migration.

The database will evolve through focused migrations as features are implemented.

---

## 59. Migration Strategy

OpsDesk should use small, understandable migrations.

Avoid one enormous migration containing every future feature.

Suggested progression:

```text
Migration 1
Workspace + Membership foundation

Migration 2
Invitations

Migration 3
Services

Migration 4
Tickets

Migration 5
Incidents + ticket links

Migration 6
SLA

Migration 7
Attachments

Migration 8
API keys

Migration 9
Webhooks

Migration 10
Audit improvements / search indexes
```

The exact order may change with implementation.

Each migration should correspond to a feature boundary where practical.

---

## 60. Production Migration Safety

Before applying production migrations:

- inspect generated SQL
- understand destructive operations
- avoid unexpected column drops
- avoid accidental data resets
- preserve backwards compatibility during risky transitions where necessary
- test migrations against realistic data when appropriate

Production databases must never use:

```text
prisma migrate reset
```

as a deployment strategy.

---

## 61. Seed Data

Development seed data may eventually create:

```text
Demo Workspace
├── Owner membership
├── Services
├── Tickets
├── Incidents
└── SLA policy
```

Seed scripts must not contain production credentials.

Production deployments should not automatically populate fake customer data.

---

## 62. Test Data Isolation

Automated tests should avoid depending on manually maintained development data.

Database integration tests should create the records they require and cleanly isolate test state.

Multi-tenancy tests should commonly create at least:

```text
Workspace A
User A

Workspace B
User B
```

Then intentionally attempt unauthorized cross-workspace operations.

---

## 63. Example Multi-Tenant Authorization Query

Suppose a user requests:

```text
GET /workspaces/acme/incidents/inc_123
```

The server should not perform:

```ts
prisma.incident.findUnique({
  where: {
    id: incidentId,
  },
});
```

and then trust the result.

A safer conceptual flow is:

```text
Resolve authenticated user
        │
        ▼
Resolve active workspace
        │
        ▼
Verify active membership
        │
        ▼
Query incident using:
id + workspaceId
```

Example:

```ts
prisma.incident.findFirst({
  where: {
    id: incidentId,
    workspaceId,
  },
});
```

Authorization helpers will centralize this pattern where possible.

---

## 64. Example Assignment Integrity

When assigning an incident:

```text
incidentId
assigneeMembershipId
```

the server must verify:

```text
incident.workspaceId == activeWorkspaceId
```

and:

```text
assignee.workspaceId == activeWorkspaceId
```

before writing:

```text
incident.assigneeMembershipId
```

Receiving both IDs from the same browser request does not prove they belong together.

---

## 65. Example Ticket Escalation

When linking a ticket to an incident:

```text
Load ticket scoped to workspace

Load incident scoped to workspace

Verify both exist

Create TicketIncidentLink

Create ticket activity

Create incident activity
```

The relationship creation and activity records should use a transaction when appropriate.

---

## 66. Historical Data Philosophy

OpsDesk should preserve enough history to answer questions such as:

```text
Who handled this incident?

When was the priority changed?

When did the SLA breach?

Which tickets were connected to this outage?

Who created this API key?

Who changed this user's role?

Which webhook deliveries failed?
```

This is why the architecture favors:

- soft membership removal
- activity events
- audit events
- durable webhook deliveries
- stored SLA timestamps

over destructive state replacement.

---

## 67. Sensitive Data

The database may contain sensitive operational data.

Never store secrets unnecessarily.

### API Keys

Store hashes.

### Invitation Tokens

Store hashes.

### Webhook Signing Secrets

Store encrypted ciphertext because the secret must be recoverable for signing.

### Authentication Secrets

Remain in environment configuration, not application tables.

### Database Credentials

Remain in environment configuration.

### Object Storage Credentials

Remain in environment configuration.

---

## 68. Metadata JSON

JSON fields are useful for event-specific metadata.

Examples:

```json
{
  "fromStatus": "OPEN",
  "toStatus": "INVESTIGATING"
}
```

or:

```json
{
  "previousRole": "VIEWER",
  "newRole": "AGENT"
}
```

JSON should not become an excuse to avoid relational modeling.

Frequently queried business state belongs in typed columns and relations.

Metadata is best for contextual event details that vary by event type.

---

## 69. Database Source of Truth Rule

The core rule is:

> PostgreSQL stores authoritative business state.

Therefore:

```text
Redis cache disappears
→ business state survives

Worker restarts
→ business state survives

Realtime gateway restarts
→ business state survives

Browser disconnects
→ business state survives
```

Ephemeral infrastructure improves delivery and performance.

It must not own irreplaceable business state.

---

## 70. Database Design Definition of Success

The database design succeeds if it allows OpsDesk to provide:

- strong tenant isolation
- multi-workspace membership
- role-based permissions
- historical actor preservation
- support ticket workflows
- incident workflows
- many-to-many ticket and incident linking
- SLA deadline tracking
- retry-safe background processing
- secure API credentials
- signed webhook delivery
- immutable audit history
- full-text search
- efficient workspace-scoped queries
- reliable relational integrity

Most importantly, the schema should make unsafe cross-workspace behavior difficult to write accidentally and straightforward to test.
