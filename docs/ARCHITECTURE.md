# OpsDesk Architecture

## Document Status

- **Version:** 0.1
- **Status:** Initial Architecture
- **Product:** OpsDesk

---

## 1. Architecture Overview

OpsDesk is a multi-tenant support and incident-management platform built as a modular full-stack application with separate processes for web requests, background work, and real-time communication.

The initial production architecture consists of:

1. A Next.js web application
2. A PostgreSQL database
3. A Redis instance
4. A background worker
5. A real-time gateway
6. Object storage
7. External authentication
8. Observability tooling

The goal is to keep the product understandable and deployable while introducing system boundaries that are meaningful for a production application.

---

## 2. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │       Browser       │
                         └──────────┬──────────┘
                                    │
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │   Next.js Web App   │
                         │                     │
                         │ Pages               │
                         │ Server Components   │
                         │ Server Actions      │
                         │ REST API            │
                         └───────┬─────┬───────┘
                                 │     │
                    ┌────────────┘     └─────────────┐
                    │                                │
                    ▼                                ▼
          ┌──────────────────┐             ┌──────────────────┐
          │   PostgreSQL     │             │      Redis       │
          │                  │             │                  │
          │ Source of truth  │             │ Jobs             │
          │ Tenant data      │             │ Pub/Sub          │
          │ Audit history    │             │ Rate limiting    │
          └──────────────────┘             └────────┬─────────┘
                                                   │
                              ┌────────────────────┴───────────────────┐
                              │                                        │
                              ▼                                        ▼
                    ┌──────────────────┐                    ┌──────────────────┐
                    │ Background       │                    │ Realtime Gateway │
                    │ Worker           │                    │                  │
                    │                  │                    │ Live updates     │
                    │ SLA jobs         │                    │ Subscriptions    │
                    │ Webhooks         │                    │ Event fan-out    │
                    │ Retries          │                    │                  │
                    └────────┬─────────┘                    └──────────────────┘
                             │
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌──────────────────┐          ┌──────────────────┐
     │ External Webhook │          │  Object Storage  │
     │ Endpoints        │          │                  │
     │                  │          │ Attachments      │
     └──────────────────┘          └──────────────────┘
```

---

## 3. Architectural Style

OpsDesk will use a **modular monolith with supporting services**.

The primary business application remains inside one codebase.

Business logic is separated by feature rather than by microservice.

Examples:

```text
src/features/workspaces
src/features/memberships
src/features/services
src/features/tickets
src/features/incidents
src/features/sla
src/features/api-keys
src/features/webhooks
src/features/audit
```

The application will not create independent microservices for every feature.

Separate processes are introduced only when their runtime requirements justify them.

The initial separate processes are:

- web application
- background worker
- real-time gateway

---

## 4. Why Not Microservices?

OpsDesk has complex business behavior, but the initial project does not require independently deployed services for each domain.

A microservice architecture would introduce additional complexity involving:

- distributed transactions
- service discovery
- multiple deployments
- duplicated authentication
- inter-service networking
- versioned internal APIs
- additional observability requirements

That complexity would not initially improve the product.

Instead, OpsDesk keeps domain logic in one repository while separating runtime processes where necessary.

---

## 5. Repository Structure

Initial target structure:

```text
opsdesk/
├── docs/
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   └── DATABASE.md
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   ├── auth/
│   │   ├── workspaces/
│   │   └── ...
│   │
│   ├── features/
│   │   ├── workspaces/
│   │   ├── memberships/
│   │   ├── invitations/
│   │   ├── services/
│   │   ├── tickets/
│   │   ├── incidents/
│   │   ├── sla/
│   │   ├── attachments/
│   │   ├── api-keys/
│   │   ├── webhooks/
│   │   └── audit/
│   │
│   ├── lib/
│   ├── server/
│   │   ├── auth/
│   │   ├── authorization/
│   │   ├── database/
│   │   ├── queue/
│   │   ├── realtime/
│   │   └── storage/
│   │
│   └── generated/
│
├── worker/
│   ├── jobs/
│   ├── processors/
│   └── index.ts
│
├── realtime/
│   └── index.ts
│
├── tests/
│
├── docker-compose.yml
├── package.json
├── prisma.config.ts
└── README.md
```

This structure may evolve as implementation reveals better boundaries.

---

## 6. Web Application

The web application will use:

- Next.js
- React
- TypeScript
- Tailwind CSS

The Next.js App Router will handle:

- page routing
- server rendering
- React Server Components
- Server Actions
- REST API route handlers
- authentication integration

Server Components should be preferred for data-heavy pages where client-side interactivity is not required.

Client Components should be introduced only when browser state or interaction requires them.

Examples:

- dialogs
- optimistic comments
- workspace switcher
- live incident timeline
- file upload progress

---

## 7. Authentication

Authentication will initially use Clerk.

Clerk is responsible for:

- user registration
- sign-in
- sign-out
- session management
- authenticated user identity

Clerk answers:

```text
Who is this user?
```

Clerk will not be treated as the source of truth for OpsDesk workspace authorization.

Workspace membership and permissions will remain in the OpsDesk PostgreSQL database.

---

## 8. Authorization

Authorization is separate from authentication.

OpsDesk authorization determines:

```text
What can this authenticated user do
inside this workspace?
```

Every protected server operation must validate:

1. authentication
2. workspace membership
3. role or permission
4. resource workspace ownership

Example:

```text
Request
   │
   ▼
Authenticated user?
   │
   ▼
Workspace membership?
   │
   ▼
Required permission?
   │
   ▼
Resource belongs to workspace?
   │
   ▼
Execute operation
```

UI permission checks are for usability only.

They are never the security boundary.

---

## 9. Multi-Tenant Model

Workspace is the primary tenant boundary.

Nearly every business record will contain a `workspaceId`.

Examples:

```text
Workspace
├── Memberships
├── Invitations
├── Services
├── Tickets
├── Incidents
├── Attachments
├── SLA Policies
├── API Keys
├── Webhooks
└── Audit Events
```

Queries should normally include the active workspace identifier.

Example:

```ts
where: {
  id: incidentId,
  workspaceId,
}
```

rather than:

```ts
where: {
  id: incidentId,
}
```

The second form is unsafe when the resource ID came from an untrusted request.

---

## 10. Database

OpsDesk will use PostgreSQL.

Production database hosting will use Neon unless deployment requirements later justify another provider.

Prisma will provide:

- schema definition
- type-safe queries
- migrations
- generated database client

PostgreSQL remains the system of record.

Redis and the real-time layer must not become authoritative sources of business state.

---

## 11. Database Design Principles

Database design will prioritize:

- explicit workspace ownership
- foreign-key integrity
- indexed tenant queries
- immutable audit records
- clear lifecycle timestamps
- safe deletion behavior
- historical activity preservation

Common indexes will include workspace ownership.

Example:

```text
(workspace_id, status)
(workspace_id, priority)
(workspace_id, created_at)
(workspace_id, assignee_id)
```

Unique human-readable issue numbers should generally be scoped to a workspace.

Example:

```text
Workspace A
INC-1001

Workspace B
INC-1001
```

is acceptable.

---

## 12. Redis

Redis will initially serve three purposes:

### Job Queue

Background work will be queued rather than performed inside user-facing requests.

### Real-Time Event Distribution

The web application and worker may publish domain events that the real-time gateway forwards to connected clients.

### Rate Limiting

Redis may be used for rate limiting public API and integration endpoints.

Redis is not a source of truth for permanent business data.

---

## 13. Background Worker

OpsDesk requires work that must continue even when no user has the site open.

A separate long-running Node.js worker will process background jobs.

The initial queue implementation will use Redis with BullMQ or an equivalent Redis-backed queue library.

Initial job categories:

```text
sla.warning
sla.breach
webhook.delivery
invitation.email
notification.delivery
```

The worker should support:

- retries
- exponential backoff where appropriate
- failure visibility
- idempotent processors
- dead/final failure states

---

## 14. Job Design

Jobs should contain identifiers rather than large copies of mutable database records.

Prefer:

```json
{
  "incidentId": "inc_123",
  "workspaceId": "ws_123"
}
```

instead of storing the entire incident inside the queue payload.

The worker should retrieve the current record when processing.

This reduces stale queued data.

---

## 15. Idempotency

Background jobs may execute more than once.

Processors must be designed with that assumption.

Example:

A webhook delivery should not accidentally create multiple independent delivery records simply because a worker restarted after sending a request.

Where duplicate side effects would be harmful, OpsDesk should use:

- unique operation identifiers
- database constraints
- atomic updates
- delivery records
- state checks

---

## 16. SLA Engine

The SLA system is one of the primary reasons for having a worker.

When an issue is created:

```text
Issue created
      │
      ▼
Determine SLA policy
      │
      ▼
Calculate deadlines
      │
      ├── Response deadline
      └── Resolution deadline
      │
      ▼
Persist deadlines
      │
      ▼
Schedule background jobs
```

The worker later verifies current database state before producing a warning or breach.

Example:

```text
SLA breach job runs
       │
       ▼
Load incident
       │
       ├── Already resolved? → stop
       │
       ├── Deadline changed? → stop/reschedule
       │
       └── Still overdue?
                │
                ▼
          Record breach
```

Scheduled jobs must not blindly assume that the issue still matches the state from when the job was created.

---

## 17. Domain Events

Important business changes should emit domain events after successful persistence.

Examples:

```text
incident.created
incident.updated
incident.assigned
incident.resolved
comment.created
ticket.created
sla.warning
sla.breached
```

Domain events may be used by:

- real-time updates
- webhook delivery
- notifications
- audit workflows
- analytics

The initial implementation does not require a full event-sourcing architecture.

PostgreSQL continues to store the authoritative current state.

---

## 18. Real-Time Architecture

Users viewing the same incident should receive live updates.

The initial architecture will use:

```text
Business mutation
      │
      ▼
PostgreSQL transaction succeeds
      │
      ▼
Publish event to Redis
      │
      ▼
Realtime Gateway
      │
      ▼
Connected workspace clients
```

The real-time gateway will be a long-running Node.js process.

It may use WebSockets or Server-Sent Events depending on the implementation tradeoffs discovered during the real-time phase.

The gateway will not write business state.

It distributes notifications that tell clients something changed.

Clients should be able to recover by refetching authoritative state from the web application.

---

## 19. Real-Time Security

Real-time connections must authenticate users.

The gateway must verify:

- valid authenticated identity
- workspace membership
- authorization to subscribe to the requested resource

A client must never be able to subscribe to another workspace merely by guessing an incident ID.

Events should be scoped by workspace and resource.

Example conceptual channels:

```text
workspace:ws_123
incident:inc_456
```

---

## 20. Comments and Optimistic UI

Comments are a strong candidate for optimistic UI.

Potential flow:

```text
User submits comment
       │
       ▼
Temporary comment appears
       │
       ▼
Server persists comment
       │
       ├── success → replace temporary state
       │
       └── failure → show retry/error state
```

Real-time events must not cause the submitting user to display duplicate comments.

Persisted IDs should be used for reconciliation.

---

## 21. Object Storage

Attachments should not be stored as database blobs.

OpsDesk will use S3-compatible object storage such as:

- Cloudflare R2
- Amazon S3
- another compatible provider

PostgreSQL will store metadata only.

Example:

```text
Attachment
├── id
├── workspaceId
├── issueId
├── uploadedById
├── fileName
├── mimeType
├── size
├── storageKey
└── createdAt
```

---

## 22. Upload Flow

Preferred attachment flow:

```text
Browser
   │
   │ request upload authorization
   ▼
OpsDesk Web App
   │
   │ create signed upload URL
   ▼
Browser
   │
   │ direct upload
   ▼
Object Storage
   │
   ▼
OpsDesk records attachment metadata
```

This prevents large file bodies from unnecessarily passing through the Next.js server.

---

## 23. Attachment Authorization

Object storage keys must never be treated as authorization.

Before generating a download URL, OpsDesk must verify that:

1. user is authenticated
2. user belongs to the workspace
3. attachment belongs to the workspace
4. user can view the parent issue

Private attachments should use short-lived signed download URLs.

---

## 24. REST API

OpsDesk will expose a versioned API under:

```text
/api/v1
```

Example:

```text
GET    /api/v1/incidents
POST   /api/v1/incidents
GET    /api/v1/incidents/:id
PATCH  /api/v1/incidents/:id
```

API routes should reuse the same domain operations as the web application where practical.

Business rules should not be duplicated between:

- Server Actions
- API routes

---

## 25. API Keys

Programmatic API access will use workspace API keys.

Conceptual format:

```text
ops_live_<secret>
```

The application should store:

```text
prefix
hash(secret)
```

and not:

```text
raw secret
```

Creation flow:

```text
Generate secret
      │
      ├── return raw key once
      │
      └── store hash
```

Incoming API requests hash or otherwise verify the presented secret against stored credentials.

Revoked keys must fail immediately.

---

## 26. API Authentication Flow

```text
API Request
     │
     ▼
Read API key
     │
     ▼
Validate key format
     │
     ▼
Find candidate key by prefix
     │
     ▼
Verify secret hash
     │
     ▼
Check revoked state
     │
     ▼
Resolve workspace
     │
     ▼
Apply authorization
     │
     ▼
Handle request
```

---

## 27. Rate Limiting

Public API endpoints should support rate limiting.

Rate limits may be keyed by:

- API key
- workspace
- endpoint category

Rate-limit enforcement must fail safely without exposing secret key material in logs.

---

## 28. Webhooks

Workspace administrators may configure outbound webhook endpoints.

Flow:

```text
Domain event
     │
     ▼
Create webhook delivery record
     │
     ▼
Queue delivery job
     │
     ▼
Worker sends HTTPS request
     │
     ├── success → mark delivered
     │
     └── failure → retry
```

Webhook requests should include:

- delivery ID
- event ID
- event type
- timestamp
- payload
- cryptographic signature

---

## 29. Webhook Signing

Each webhook endpoint will have a secret.

The worker signs the request payload using an HMAC-based signature.

Conceptual headers:

```text
X-OpsDesk-Event
X-OpsDesk-Delivery
X-OpsDesk-Timestamp
X-OpsDesk-Signature
```

Receivers can verify that the request originated from OpsDesk and was not modified.

Webhook secrets must not be logged.

---

## 30. Webhook Retries

Webhook delivery is inherently unreliable.

A destination may:

- time out
- return a server error
- become temporarily unavailable

Failed deliveries should use retry behavior with bounded exponential backoff.

Example:

```text
Attempt 1 → immediate
Attempt 2 → delayed
Attempt 3 → longer delay
Attempt 4 → final failure
```

Exact retry timing will be defined during implementation.

---

## 31. Audit Logging

Audit logging is separate from issue activity.

Issue activity answers:

```text
What happened to this ticket or incident?
```

Audit logs answer:

```text
Who performed a sensitive workspace action?
```

Audit events should be append-only through normal product flows.

Examples:

```text
member.invited
member.role_changed
member.removed
api_key.created
api_key.revoked
webhook.created
webhook.deleted
workspace.updated
```

---

## 32. Transactions

Operations that modify multiple related records should use database transactions when atomicity is required.

Example incident status change:

```text
Update incident
       +
Create activity event
       +
Potentially update resolution timestamp
```

should succeed or fail as one logical operation when possible.

External side effects such as webhook delivery should not occur inside a database transaction.

They should be queued after persistence.

---

## 33. Transactional Event Reliability

A potential failure exists when:

```text
Database commit succeeds
        │
        ▼
Process crashes
        │
        ▼
Queue event never published
```

For workflows where losing the event would be unacceptable, OpsDesk may introduce a transactional outbox pattern.

Conceptual model:

```text
Database transaction
      │
      ├── update business record
      └── create outbox event
             │
             ▼
       background publisher
             │
             ▼
           Redis
```

The initial implementation should introduce the outbox only where the reliability requirement justifies the additional complexity.

---

## 34. Search

Initial search should use PostgreSQL capabilities.

Search scope:

- incidents
- tickets
- comments
- services

All queries must remain tenant-scoped.

A dedicated search engine should not be introduced until PostgreSQL search becomes an actual limitation.

---

## 35. Validation

Zod will be used for application-level validation.

Validation belongs at system boundaries.

Examples:

- Server Action input
- API request bodies
- query parameters
- invitation tokens
- API configuration
- webhook endpoints
- upload metadata

Database constraints remain necessary even when Zod validation exists.

Application validation improves errors.

Database constraints protect integrity.

---

## 36. Error Handling

Errors should be separated into categories where useful.

Examples:

```text
AuthenticationError
AuthorizationError
ValidationError
NotFoundError
ConflictError
RateLimitError
IntegrationError
```

Users should receive useful errors without internal implementation details.

Production logs may contain more diagnostic context.

---

## 37. Logging

Server logs should be structured.

Important context may include:

```text
requestId
workspaceId
userId
resourceId
jobId
eventType
```

Secrets must never be logged.

Do not log:

```text
raw API keys
database URLs
Clerk secrets
webhook secrets
signed upload credentials
```

---

## 38. Observability

The final production system should provide visibility into:

- application errors
- worker errors
- failed jobs
- webhook failures
- queue depth
- request failures
- unexpected authorization failures

An error-monitoring platform such as Sentry may be introduced during the observability phase.

Observability should help answer:

```text
What failed?
Where did it fail?
Which workspace was affected?
Can it be retried?
```

without exposing sensitive data.

---

## 39. Testing Architecture

Testing will use multiple levels.

### Unit Tests

For isolated logic such as:

- permissions
- SLA calculations
- API key generation
- webhook signing
- validation

### Server Workflow Tests

For:

- workspace creation
- membership changes
- ticket creation
- incident transitions
- cross-workspace protection
- API authentication

### Worker Tests

For:

- SLA jobs
- retries
- webhook delivery state
- idempotency

### Component Tests

For important interactive UI behavior.

### End-to-End Tests

Playwright will eventually cover critical flows such as:

```text
sign in
create workspace
invite member
create incident
assign incident
comment
resolve incident
```

---

## 40. Local Development

The project should support local development without requiring every production cloud dependency.

A future Docker Compose configuration may provide:

```text
PostgreSQL
Redis
```

The web application, worker, and realtime process can run locally as normal Node processes.

Conceptual commands may eventually resemble:

```text
npm run dev
npm run worker:dev
npm run realtime:dev
```

The exact scripts will be defined when those processes are introduced.

---

## 41. Production Deployment

Initial target architecture:

```text
Next.js Web App
      │
      └── Vercel

PostgreSQL
      │
      └── Neon

Redis
      │
      └── Managed Redis provider

Worker
      │
      └── Long-running container host

Realtime Gateway
      │
      └── Long-running container host

Attachments
      │
      └── S3-compatible object storage
```

The worker and realtime gateway require a runtime suitable for long-lived Node processes.

They should not be forced into a short-lived request model simply to keep all deployments on one platform.

---

## 42. Environment Separation

Production, preview, and development environments should not accidentally share sensitive resources.

Where practical:

```text
development
preview
production
```

should use isolated:

- databases
- Redis namespaces or instances
- storage prefixes/buckets
- API credentials
- webhook secrets

Production test data should not be mixed with local development data.

---

## 43. Security Boundaries

The primary security boundaries are:

### Browser → Web Server

Never trust:

- user IDs
- workspace IDs
- roles
- permissions
- prices
- status transitions
- ownership claims

without server validation.

### Web Server → Database

Queries must enforce tenant ownership.

### API Client → REST API

API key and workspace permissions must be validated.

### Browser → Object Storage

Upload authorization must be short-lived and scoped.

### Redis → Worker

Job payloads are instructions, not authorization proof.

The worker must still load and validate relevant current state.

### Realtime Client → Gateway

Subscriptions must be authenticated and tenant-scoped.

### Worker → Webhook Destination

Outbound requests require safe URL handling, bounded timeouts, and controlled retries.

---

## 44. External URL Security

Webhook destinations are user-controlled URLs.

Because the worker will make requests to those URLs, webhook delivery introduces SSRF risk.

The webhook system must eventually include protections such as:

- HTTPS requirements where appropriate
- URL validation
- restricted ports
- private-network blocking
- DNS/IP validation
- redirect controls
- request timeouts
- response-size limits

The lessons from the Application Tracker job-posting importer should be applied here, with stricter controls because webhook requests may occur repeatedly.

---

## 45. Data Ownership Rule

A central OpsDesk engineering rule is:

> A resource identifier does not grant access to the resource.

For example:

```text
/incidents/inc_123
```

does not mean the current user may access `inc_123`.

The server must prove that:

```text
user
  ↓
membership
  ↓
workspace
  ↓
incident
```

forms a valid authorized chain.

---

## 46. Deletion Strategy

Deletion behavior will vary by resource.

Potential examples:

### Workspace

High-risk destructive operation.

Should require Owner permission and explicit confirmation.

### Incident

May eventually prefer archive/soft-delete behavior to preserve historical context.

### Audit Event

Should not be normally deletable.

### API Key

Should be revoked rather than reused.

### Membership

May be removed while preserving historical actor references where possible.

Exact database behavior will be specified in `DATABASE.md`.

---

## 47. Time Handling

All database timestamps should be stored in UTC.

Examples:

```text
createdAt
updatedAt
resolvedAt
responseDeadline
resolutionDeadline
```

User-facing dates may be converted to the appropriate display timezone.

SLA calculations must not depend on the browser clock.

Server-side time is authoritative.

---

## 48. Issue Numbering

Tickets and incidents should have human-readable workspace-scoped identifiers.

Examples:

```text
TKT-1042
INC-0184
```

Internal database IDs remain separate.

This means the product can use:

```text
internal ID:
cm123abc...

display ID:
INC-0184
```

Display numbers are designed for humans.

Internal IDs are designed for persistence and relations.

---

## 49. Key Architectural Principles

OpsDesk development should follow these principles:

### 1. PostgreSQL is the source of truth

Redis and real-time messages are temporary infrastructure.

### 2. Authentication is not authorization

A signed-in user is not automatically allowed to access a workspace.

### 3. Every tenant-owned query is scoped

Workspace ownership is part of the query whenever possible.

### 4. External side effects are asynchronous when practical

Webhook delivery should not block an incident update request.

### 5. Background work is retry-safe

Workers must expect duplicate execution.

### 6. Real-time updates are recoverable

Missing one event should not corrupt client state.

### 7. Business logic is shared

Server Actions and API routes should not implement conflicting versions of the same rules.

### 8. Security is enforced server-side

Hidden buttons are not authorization.

### 9. Complexity must earn its place

Infrastructure should solve an actual requirement rather than exist solely to make the architecture look impressive.

### 10. Production behavior matters

Retries, failures, authorization, logs, migrations, and deployment are part of the product.

---

## 50. Initial Technology Direction

Current planned stack:

```text
Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

Authentication
- Clerk

Validation
- Zod

Database
- PostgreSQL
- Prisma
- Neon in production

Queue / Distributed State
- Redis
- BullMQ or equivalent

Background Processing
- Node.js worker

Realtime
- Redis Pub/Sub
- dedicated Node.js realtime gateway
- WebSocket or SSE transport

Object Storage
- S3-compatible storage

Testing
- Vitest
- React Testing Library
- Playwright

Deployment
- Vercel for web
- long-running container hosting for worker/realtime
- managed PostgreSQL
- managed Redis
- managed object storage

Observability
- structured logging
- error monitoring
```

Specific managed vendors beyond the core stack may change during implementation without changing the overall architecture.

---

## 51. Architecture Evolution

This architecture is intentionally designed to evolve.

Features should begin with the simplest implementation that preserves the intended boundaries.

Examples:

```text
PostgreSQL search
before
Elasticsearch

Redis queue
before
Kafka

Modular monolith
before
microservices

Single worker pool
before
specialized worker fleets
```

OpsDesk should demonstrate engineering judgment, not infrastructure collecting.

---

## 52. Architecture Definition of Success

The architecture succeeds if OpsDesk can demonstrate:

- secure multi-tenancy
- explicit role-based authorization
- reliable relational persistence
- asynchronous background processing
- retry-safe side effects
- real-time collaboration
- private object storage
- external API access
- signed outbound webhooks
- immutable security auditing
- production observability
- responsive web interfaces
- automated testing across system boundaries

The final architecture should be more sophisticated than Application Tracker because the product requirements demand additional system boundaries, not because unnecessary services were added.
