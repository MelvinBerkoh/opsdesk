# OpsDesk Product Requirements

## Document Status

- **Version:** 0.1
- **Status:** Initial Product Definition
- **Product:** OpsDesk
- **Type:** Multi-tenant support and incident management platform

---

## 1. Product Overview

OpsDesk is a multi-tenant support and incident management platform for teams that need to receive, investigate, assign, track, and resolve operational issues.

The product combines concepts from help desk software, incident management platforms, and internal operations tools.

Organizations create workspaces, invite team members, configure services, receive issues, assign ownership, collaborate through comments and activity history, track response deadlines, and resolve incidents from one centralized system.

OpsDesk is designed as a portfolio-grade production application that demonstrates team-based authorization, real-time collaboration, background processing, external integrations, API design, and reliable multi-tenant data isolation.

---

## 2. Problem

Teams frequently manage operational issues across disconnected tools such as:

- email
- chat messages
- spreadsheets
- issue trackers
- monitoring alerts
- support inboxes

This creates several problems:

- unclear ownership
- missed or delayed responses
- poor visibility into issue severity
- lost investigation context
- inconsistent escalation
- weak historical records
- difficulty measuring response performance

OpsDesk provides one structured workflow for managing an issue from initial report through resolution.

---

## 3. Product Goals

OpsDesk should allow a team to:

1. Create and manage an organization workspace.
2. Invite and manage workspace members.
3. Control access through role-based permissions.
4. Create and manage support tickets and incidents.
5. Assign issues to specific team members.
6. Track issue priority, status, and affected service.
7. Collaborate through comments and activity history.
8. Track response and resolution deadlines.
9. Automatically identify SLA warnings and breaches.
10. Receive live updates when another team member changes an incident.
11. Upload and attach files to issues.
12. Search historical tickets, incidents, and comments.
13. Create API keys for programmatic access.
14. Send outbound webhooks when important events occur.
15. Maintain an immutable audit history of sensitive actions.
16. Provide useful operational metrics from a dashboard.

---

## 4. Non-Goals

The initial product will not attempt to become:

- a full project-management platform
- a general-purpose calendar
- a complete CRM
- a full observability platform
- a replacement for Datadog or Sentry
- a complete email help desk
- an AI-first support product
- a billing or subscription platform
- a native mobile application
- a full IT asset management system

These features may be explored later if they clearly improve the core incident-management workflow.

---

## 5. Core Domain Concepts

### User

A person authenticated with OpsDesk.

A user may belong to multiple workspaces.

### Workspace

An organization or team using OpsDesk.

Examples:

- Acme Corp
- Startup XYZ
- Engineering Team
- Internal IT

All workspace-owned resources must be isolated from other workspaces.

### Membership

Connects a user to a workspace.

A membership defines the user's role inside that workspace.

### Service

A system or product that incidents can affect.

Examples:

- Payments API
- Authentication
- Customer Dashboard
- Email Delivery
- Checkout
- Internal Network

### Ticket

A reported issue that requires investigation or support.

A ticket may remain a normal support request or be escalated into an incident.

### Incident

A higher-severity operational issue requiring coordinated response.

Examples:

- production API outage
- payment failures
- authentication outage
- degraded checkout performance
- data synchronization failure

### Comment

A message added by a workspace member to a ticket or incident.

Comments support collaborative investigation.

### Activity Event

A historical record describing something that happened to a ticket or incident.

Examples:

- status changed
- priority changed
- assignee changed
- comment added
- incident resolved
- SLA breached

### Audit Event

A security-sensitive, immutable record of an important workspace action.

Examples:

- member invited
- member role changed
- API key created
- webhook deleted
- workspace setting changed

Audit events are separate from normal issue activity.

### SLA Policy

Defines expected response and resolution time based on priority.

Example:

| Priority | Response | Resolution |
| --- | --- | --- |
| P0 Critical | 15 minutes | 1 hour |
| P1 High | 1 hour | 4 hours |
| P2 Medium | 4 hours | 1 business day |
| P3 Low | 1 business day | 3 business days |

### API Key

A workspace credential used to access the OpsDesk API programmatically.

Raw API keys must not be permanently stored after creation.

### Webhook Endpoint

A customer-configured endpoint that receives OpsDesk events.

Examples:

- `incident.created`
- `incident.updated`
- `incident.resolved`
- `sla.warning`
- `sla.breached`

---

## 6. Workspace Roles

OpsDesk will initially support four workspace roles.

### Owner

The highest-permission role.

Can:

- manage workspace settings
- manage all members
- invite members
- change member roles
- remove members
- manage services
- manage tickets and incidents
- create API keys
- configure webhooks
- view audit logs
- delete the workspace

### Admin

Can:

- invite members
- manage most members
- manage services
- manage tickets and incidents
- configure API keys
- configure webhooks
- view audit logs

Cannot:

- delete the workspace
- remove or demote the workspace owner

### Agent

Can:

- view tickets and incidents
- create tickets
- create incidents
- comment
- update issues
- assign issues when permitted
- resolve issues

Cannot:

- manage workspace membership
- manage API keys
- manage webhooks
- modify workspace security settings

### Viewer

Can:

- view tickets
- view incidents
- view services
- view issue activity

Cannot modify workspace data.

---

## 7. Primary User Flows

### 7.1 Workspace Creation

1. User signs in.
2. User creates a workspace.
3. User becomes the workspace Owner.
4. User is redirected to the workspace dashboard.
5. User may invite additional members.

### 7.2 Workspace Switching

A user belonging to multiple workspaces can switch between them.

All subsequent requests must be scoped to the active workspace.

Changing a URL or resource ID must never allow access to another workspace's data.

### 7.3 Member Invitation

1. Owner or Admin enters an email address.
2. OpsDesk creates an invitation.
3. Invitee receives an invitation link.
4. Invitee signs in or creates an account.
5. Invitee accepts the invitation.
6. A workspace Membership is created.

Expired, revoked, or previously accepted invitations cannot be reused.

### 7.4 Ticket Creation

A workspace member creates a ticket with:

- title
- description
- priority
- affected service
- optional assignee
- optional attachments

The system records a creation activity event.

### 7.5 Incident Creation

A member creates an incident directly or escalates an existing ticket.

An incident contains:

- incident number
- title
- description
- priority
- status
- affected service
- assignee
- reporter
- SLA deadlines
- timestamps

### 7.6 Incident Lifecycle

Initial statuses:

- Open
- Investigating
- Monitoring
- Resolved

Typical lifecycle:

```text
Open
  ↓
Investigating
  ↓
Monitoring
  ↓
Resolved
```

The application records every status transition in the incident activity timeline.

### 7.7 Assignment

An incident may be assigned to a workspace member.

Assignment changes must create activity events.

A user from another workspace must never be assignable.

### 7.8 Collaboration

Workspace members can comment on tickets and incidents.

Comments should appear chronologically in the issue timeline.

Other users viewing the issue should receive new comments without requiring a full page reload.

### 7.9 SLA Tracking

When an issue is created:

1. OpsDesk determines the applicable SLA policy.
2. Response and resolution deadlines are calculated.
3. Background jobs monitor those deadlines.
4. Warning events are generated before deadlines.
5. Breach events are generated when deadlines pass.
6. The dashboard reflects at-risk and breached issues.

SLA processing must not depend on a user having the application open.

### 7.10 Resolution

When an incident is resolved:

1. Member changes status to Resolved.
2. Resolution timestamp is recorded.
3. Relevant pending SLA work is closed or ignored.
4. Activity event is generated.
5. Real-time subscribers receive the update.
6. Outbound webhook event may be queued.

---

## 8. Dashboard Requirements

The workspace dashboard should surface operational information quickly.

Initial metrics:

- open tickets
- open incidents
- critical incidents
- incidents assigned to the current user
- SLA at risk
- SLA breached
- recently updated incidents
- recently resolved incidents

Example:

```text
OPEN INCIDENTS        SLA AT RISK
      8                    3

CRITICAL INCIDENTS
---------------------------------
Payment API outage              P0
Authentication failures         P1
```

Dashboard metrics must only include data from the active workspace.

---

## 9. Ticket Requirements

Tickets must support:

- unique ticket number
- title
- description
- priority
- status
- reporter
- assignee
- service
- comments
- attachments
- created timestamp
- updated timestamp
- activity history

Initial ticket statuses:

- Open
- In Progress
- Waiting
- Resolved
- Closed

---

## 10. Incident Requirements

Incidents must support:

- unique incident number
- title
- description
- priority
- status
- service
- reporter
- assignee
- response deadline
- resolution deadline
- acknowledged timestamp
- resolved timestamp
- comments
- attachments
- activity timeline

Initial priorities:

- P0 — Critical
- P1 — High
- P2 — Medium
- P3 — Low

---

## 11. Real-Time Requirements

Users viewing the same incident should receive updates when:

- status changes
- priority changes
- assignee changes
- comments are added
- incident is resolved

The initial implementation may use Server-Sent Events or another appropriate real-time transport.

Real-time delivery must not replace database persistence.

The database remains the source of truth.

---

## 12. Background Job Requirements

OpsDesk will require background processing for operations that should not block web requests.

Initial background jobs include:

- SLA warning checks
- SLA breach handling
- webhook delivery
- webhook retries
- invitation email delivery
- future notification workflows

Background jobs should support:

- retries
- failure tracking
- idempotent processing where appropriate

---

## 13. Attachment Requirements

Users should be able to attach files to tickets and incidents.

Files should be stored in object storage rather than directly inside PostgreSQL.

PostgreSQL should store attachment metadata such as:

- ID
- workspace
- issue
- file name
- MIME type
- file size
- object storage key
- uploader
- created timestamp

Uploads should use signed URLs when practical.

---

## 14. Search Requirements

Users should be able to search workspace data.

Initial searchable content:

- ticket titles
- ticket descriptions
- incident titles
- incident descriptions
- comments
- service names

Search results must always be restricted to the active workspace.

The initial implementation should prefer PostgreSQL search capabilities before introducing a dedicated search service.

---

## 15. API Requirements

OpsDesk will expose a versioned REST API.

Initial base path:

```text
/api/v1
```

Potential initial endpoints:

```text
GET    /api/v1/incidents
POST   /api/v1/incidents
GET    /api/v1/incidents/:id
PATCH  /api/v1/incidents/:id

GET    /api/v1/tickets
POST   /api/v1/tickets
GET    /api/v1/tickets/:id
PATCH  /api/v1/tickets/:id
```

API access should use workspace API keys.

API authorization must enforce the same workspace boundaries as the web application.

---

## 16. API Key Requirements

Owners and Admins may create API keys.

Each key should contain:

- ID
- workspace
- display name
- prefix
- hashed secret
- creator
- last-used timestamp
- created timestamp
- revoked timestamp

The raw secret should only be shown once when created.

Example:

```text
ops_live_********************************
```

The raw key must not be recoverable from the database.

---

## 17. Webhook Requirements

Workspace administrators may configure outbound webhook endpoints.

Supported initial events may include:

```text
incident.created
incident.updated
incident.resolved
ticket.created
sla.warning
sla.breached
```

Webhook deliveries should include:

- unique delivery ID
- event type
- timestamp
- workspace identifier
- event payload

Requests should be cryptographically signed so receivers can verify authenticity.

Failed deliveries should be retried through the background job system.

Delivery history should display:

- endpoint
- event
- HTTP status
- attempt count
- delivery timestamp
- success or failure

---

## 18. Audit Log Requirements

Security-sensitive workspace actions must produce immutable audit events.

Initial events include:

- workspace created
- member invited
- invitation revoked
- member joined
- member removed
- member role changed
- service created
- API key created
- API key revoked
- webhook created
- webhook updated
- webhook deleted

Audit events should store:

- workspace
- actor
- event type
- target type
- target identifier
- metadata
- timestamp

Audit records should not be editable through normal application workflows.

---

## 19. Authentication Requirements

Authentication will be handled by an external authentication provider.

The application must support:

- sign-up
- sign-in
- sign-out
- session management
- protected routes
- server-side user identification

Authentication answers:

> Who is this user?

Workspace authorization separately answers:

> What is this user allowed to do here?

These responsibilities must remain distinct.

---

## 20. Authorization Requirements

Authorization must be enforced server-side.

Client-side hiding of buttons is not sufficient security.

Every protected mutation must validate:

1. authenticated user
2. workspace membership
3. required role or permission
4. ownership of the target resource by that workspace

Example:

```text
Authenticated?
      ↓
Workspace member?
      ↓
Permission allowed?
      ↓
Resource belongs to workspace?
      ↓
Perform operation
```

Resource IDs supplied by users must never be trusted as proof of access.

---

## 21. Multi-Tenant Isolation

Multi-tenant isolation is a core security requirement.

Workspace A must never be able to:

- read Workspace B tickets
- read Workspace B incidents
- assign Workspace B users
- access Workspace B attachments
- access Workspace B audit logs
- trigger Workspace B webhooks
- use Workspace B API keys

Tests must explicitly verify cross-workspace access is rejected.

---

## 22. Validation Requirements

All untrusted input must be validated before persistence or external side effects.

Validation should cover:

- forms
- API requests
- query parameters
- webhook configuration
- identifiers
- uploaded file metadata
- workspace invitations

---

## 23. Error Handling

User-facing failures should provide useful feedback without exposing sensitive implementation details.

The application should handle:

- authentication failures
- authorization failures
- validation failures
- missing records
- duplicate records
- expired invitations
- upload failures
- webhook failures
- queue failures
- database failures

Production logs should contain enough structured information for debugging.

---

## 24. Observability

The production application should eventually provide:

- structured server logging
- error monitoring
- background job visibility
- webhook delivery logs
- request correlation where appropriate

Sensitive values must not be written into logs.

Examples of values that must not be logged:

- passwords
- Clerk secrets
- raw API keys
- webhook signing secrets
- database credentials

---

## 25. Responsive Design

OpsDesk should be usable on:

- desktop
- tablet
- mobile

Desktop layouts may provide information-dense tables.

Mobile layouts should prioritize:

- issue title
- priority
- status
- assignee
- SLA state

Mobile users should not be required to horizontally scroll large desktop tables for normal workflows.

---

## 26. Accessibility

The interface should include:

- semantic HTML
- keyboard-accessible controls
- visible focus states
- descriptive labels
- accessible dialogs
- sufficient color contrast
- status information that is not communicated through color alone

---

## 27. Performance Expectations

Initial goals:

- avoid unnecessary client-side JavaScript
- use server rendering where appropriate
- paginate large issue collections
- avoid loading complete activity histories unnecessarily
- index common database filters
- move expensive asynchronous operations into background jobs

Optimization should be driven by measured bottlenecks rather than premature infrastructure complexity.

---

## 28. Testing Strategy

The project should include automated tests for important business rules.

High-priority areas:

### Authentication

- unauthenticated requests rejected

### Multi-Tenancy

- cross-workspace reads rejected
- cross-workspace writes rejected

### RBAC

- Viewer cannot modify data
- Agent cannot manage members
- Admin cannot delete workspace
- Owner can manage workspace

### Tickets and Incidents

- creation
- assignment
- status changes
- resolution

### SLA

- deadlines calculated correctly
- warnings generated correctly
- breaches generated correctly
- resolved incidents do not continue breaching

### API Keys

- raw secrets not stored
- revoked keys rejected
- wrong workspace keys rejected

### Webhooks

- signatures generated
- failures retried
- successful deliveries not duplicated unnecessarily

### Invitations

- valid invitations accepted
- expired invitations rejected
- revoked invitations rejected
- invitations cannot be reused incorrectly

---

## 29. Production Readiness

Before the initial portfolio release:

- authentication works
- workspace isolation is tested
- RBAC is enforced server-side
- ticket workflow works
- incident workflow works
- SLA processing works
- background worker is deployed
- real-time incident updates work
- file uploads work
- API keys work
- webhook delivery works
- database migrations are production-safe
- mobile layouts are verified
- error monitoring is configured
- automated tests pass
- lint passes
- TypeScript passes
- production build passes
- production smoke tests pass

---

## 30. Planned Development Phases

### Phase 1 — Project Foundation

- repository standards
- documentation
- development tooling
- environment configuration
- testing foundation

### Phase 2 — Database Foundation

- PostgreSQL
- Prisma
- core schema
- migrations

### Phase 3 — Authentication

- user authentication
- protected routes

### Phase 4 — Workspace Multi-Tenancy

- workspace creation
- memberships
- active workspace
- workspace isolation

### Phase 5 — RBAC & Invitations

- roles
- permission system
- member management
- invitation workflow

### Phase 6 — Services

- create services
- edit services
- archive services

### Phase 7 — Tickets

- ticket CRUD
- assignment
- filtering
- ticket activity

### Phase 8 — Incidents

- incident CRUD
- priorities
- status lifecycle
- assignment
- incident timeline

### Phase 9 — SLA Engine

- SLA policies
- deadline calculations
- risk state
- breach state

### Phase 10 — Background Processing

- Redis
- job queue
- worker process
- retries
- scheduled SLA jobs

### Phase 11 — Real-Time Collaboration

- live incident updates
- live comments
- stale state handling

### Phase 12 — Attachments

- object storage
- signed uploads
- attachment metadata
- authorization

### Phase 13 — API

- `/api/v1`
- API key authentication
- rate limiting
- API documentation

### Phase 14 — Webhooks

- endpoint management
- event delivery
- signatures
- retries
- delivery logs

### Phase 15 — Search & Analytics

- full-text search
- workspace metrics
- operational analytics

### Phase 16 — Audit & Observability

- immutable audit log
- structured logging
- error monitoring

### Phase 17 — Production Polish

- responsive UI
- accessibility
- empty states
- loading states
- errors
- production testing
- README
- screenshots
- case study

---

## 31. Definition of Success

OpsDesk is successful when it demonstrates a realistic multi-user production system where:

- organizations can safely share one platform
- permissions are enforced correctly
- operational issues can be managed end-to-end
- deadlines continue being processed when users are offline
- users see collaborative updates in real time
- external systems can integrate through APIs and webhooks
- sensitive operations leave an audit trail
- failures are observable
- critical workflows are covered by automated tests

The final product should demonstrate engineering depth beyond basic CRUD by combining application development with authorization, asynchronous processing, distributed system boundaries, and production reliability.
