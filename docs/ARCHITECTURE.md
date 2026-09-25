# OpsDesk Architecture

This document describes the architecture that is actually used by the current deployed version of OpsDesk.

The first architecture draft explored Redis, background workers, a real-time gateway, object storage, API keys, and webhooks. Those are still useful future directions, but they are not part of the current release.

## 1. System overview

OpsDesk is a modular full-stack Next.js application.

```text
Browser
   |
   | HTTPS
   v
Next.js app on Vercel
   |
   +-- Clerk
   |    └── authentication and sessions
   |
   +-- Server Components / Server Actions
   |    └── authorization and business rules
   |
   +-- Prisma
        |
        v
PostgreSQL on Neon
```

PostgreSQL is the source of truth for application data.

## 2. Why a modular monolith?

OpsDesk has several business areas, but they do not need independent deployments.

Keeping them in one codebase makes the system easier to understand, test, deploy, and change.

The code is split by feature:

```text
src/features/
├── incidents/
├── invitations/
├── members/
├── services/
├── tickets/
└── workspaces/
```

Shared infrastructure lives under `src/server`.

```text
src/server/
├── authorization/
└── database/
```

This keeps business boundaries clear without adding distributed-system complexity that the current product does not need.

## 3. Web application

The web layer uses:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

Server Components are used for data-heavy pages.

Client Components are used where browser interaction is needed, such as forms, live SLA countdown display, navigation state, and authentication UI.

## 4. Authentication

Clerk answers one question:

> Who is this user?

It handles sign-up, sign-in, sign-out, sessions, and protected routes.

Clerk is not the source of truth for workspace permissions.

## 5. Authorization

OpsDesk answers a different question:

> What can this user do inside this workspace?

Protected server operations validate:

```text
authenticated user
        |
        v
active workspace membership
        |
        v
required permission
        |
        v
resource belongs to workspace
        |
        v
operation runs
```

UI checks improve the experience, but the server is the security boundary.

## 6. Multi-tenancy

`Workspace` is the tenant boundary.

Tenant-owned resources are scoped to a workspace. This includes:

- memberships
- invitations
- services
- tickets
- ticket activity
- incidents
- incident activity

A resource ID alone is never treated as proof that the current user may access the resource.

Preferred query shape:

```ts
where: {
  id: resourceId,
  workspaceId,
}
```

## 7. Role model

The current roles are:

| Role   | Main purpose                        |
| ------ | ----------------------------------- |
| Owner  | Full workspace control              |
| Admin  | Team and operational management     |
| Agent  | Day-to-day ticket and incident work |
| Viewer | Read-only access                    |

Permissions are defined centrally and checked by server-side authorization helpers.

## 8. Ticket workflow

The ticket flow is:

```text
Create ticket
    |
    v
Assign service / assignee
    |
    v
Move through ticket statuses
    |
    +--> Resolve / close
    |
    +--> Escalate
             |
             v
          Incident
```

Important ticket changes create activity records.

## 9. Incident workflow

An incident can be created from a ticket escalation.

The current incident lifecycle is:

```text
OPEN
  |
  v
INVESTIGATING
  |
  v
MONITORING
  |
  v
RESOLVED
```

Incidents keep their own priority, service, owner, timestamps, and activity history.

## 10. SLA design

Each ticket gets two stored deadlines:

- first-response deadline
- resolution deadline

Current targets:

| Priority | Response | Resolution |
| -------- | -------: | ---------: |
| P0       |   15 min |    4 hours |
| P1       |   1 hour |    8 hours |
| P2       |  4 hours |   24 hours |
| P3       |  8 hours |   72 hours |

The ticket stores:

```text
responseDeadline
resolutionDeadline
firstResponseAt
resolvedAt
responseWarningAt
resolutionWarningAt
responseBreachedAt
resolutionBreachedAt
```

The SLA evaluator maps a target to one of these states:

```text
ON_TRACK
WARNING
BREACHED
MET
```

Warning and breach writes use conditional updates. This prevents normal repeated page loads from creating the same system activity more than once.

### Current limitation

The deployed release evaluates and persists SLA state when ticket detail data is loaded.

A future version could move this into an unattended scheduled worker so warnings and breaches are processed even if nobody opens the ticket.

## 11. Transactions

Transactions are used when multiple writes belong to one business operation.

Examples include:

- incrementing a workspace ticket sequence and creating the ticket
- writing ticket state and related activity
- creating incident state and related activity

This keeps partially completed workflows from becoming normal application state.

## 12. Activity history

Ticket and incident activity is separate from the main record.

Activity answers:

> What happened to this issue?

Examples:

```text
Ticket created
Priority changed
Assignee changed
Status changed
SLA warning
SLA breached
Incident linked
Incident resolved
```

System-generated events may have no user actor.

## 13. Deployment

Current production setup:

```text
Next.js application  -> Vercel
PostgreSQL           -> Neon
Authentication       -> Clerk
```

The Prisma client is generated during the production build.

## 14. Testing

The current test suite focuses on important business behavior, including:

- workspace authorization
- permissions
- workspace creation
- invitations
- member management
- services
- ticket creation
- SLA calculations

The main local quality gate is:

```bash
npm run check
```

It runs linting, type checking, tests, and a production build.

## 15. Future architecture

These are possible next steps, not current production features:

```text
Scheduled SLA worker
Real-time incident updates
Attachments / object storage
REST API
API keys
Outbound webhooks
Immutable security audit log
Expanded observability
```

If they are added later, each boundary should solve a real product need rather than exist only to make the architecture look more complicated.
