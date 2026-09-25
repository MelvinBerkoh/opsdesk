# OpsDesk Product Requirements

## 1. Product

OpsDesk is a multi-tenant support and incident management app.

It gives engineering and operations teams one place to manage tickets, services, escalation, incident response, ownership, history, and SLA deadlines.

## 2. Problem

Operational issues often get spread across chat, email, spreadsheets, and separate issue trackers.

That makes it easy to lose:

- ownership
- severity
- response deadlines
- investigation history
- escalation context

OpsDesk gives the issue one clear workflow from report to resolution.

## 3. Current release goals

The deployed release should let a team:

1. Create a workspace.
2. Invite and manage members.
3. Apply role-based permissions.
4. Create and manage services.
5. Create and manage tickets.
6. Assign tickets to team members.
7. Track priority and status.
8. Escalate a ticket into an incident.
9. Manage the incident lifecycle.
10. Keep ticket and incident activity history.
11. Track first-response and resolution SLA targets.
12. Use the product on desktop and mobile.
13. Pass automated checks and run in production.

## 4. Core concepts

### Workspace

A workspace is one tenant.

All workspace-owned data must stay isolated from other workspaces.

### Membership

A membership connects a signed-in user to a workspace and gives that user a role.

### Service

A service is a product or system affected by a ticket or incident.

Examples:

```text
Payments API
Authentication
Checkout
Customer Dashboard
```

### Ticket

A ticket is a support or operational issue that needs investigation.

A ticket can stay a normal support issue or be escalated into an incident.

### Incident

An incident is a higher-severity issue that needs coordinated response.

### Activity

Activity records what happened to an issue.

Examples:

```text
Status changed
Priority changed
Assignee changed
SLA warning
SLA breached
Ticket escalated
Incident resolved
```

## 5. Roles

| Role | What it is for |
| --- | --- |
| Owner | Full workspace control |
| Admin | Team and operational management |
| Agent | Ticket and incident work |
| Viewer | Read-only access |

Authorization is enforced on the server.

Hiding a button in the browser is not treated as a security boundary.

## 6. Main user flows

### Create a workspace

```text
Sign in
  |
  v
Create workspace
  |
  v
Become Owner
  |
  v
Open workspace
```

### Invite a member

```text
Owner/Admin creates invite
  |
  v
Invite is accepted
  |
  v
Membership is created
```

Expired, revoked, or previously accepted invitations cannot be reused.

### Work a ticket

A ticket includes:

```text
title
description
priority
status
service
reporter
optional assignee
SLA deadlines
activity history
```

Typical flow:

```text
OPEN
  |
  v
IN_PROGRESS
  |
  +--> WAITING
  |
  v
RESOLVED
  |
  v
CLOSED
```

### Escalate a ticket

```text
Ticket
  |
  | Escalate
  v
Incident
```

The incident keeps a link back to the source ticket.

### Work an incident

Current lifecycle:

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

Important changes create incident activity.

## 7. SLA behavior

Each ticket gets a response target and resolution target when it is created.

Current targets:

| Priority | Response | Resolution |
| --- | ---: | ---: |
| P0 | 15 min | 4 hours |
| P1 | 1 hour | 8 hours |
| P2 | 4 hours | 24 hours |
| P3 | 8 hours | 72 hours |

The UI can show:

```text
ON TRACK
WARNING
BREACHED
MET
```

A first operational response is currently recorded when the ticket first moves out of `OPEN`.

Changing the priority of an unresolved ticket recalculates active targets.

SLA warning and breach events are written as system activity and protected against normal duplicate writes.

### Current limitation

The current release evaluates SLA state when ticket detail is loaded.

A later release could add an unattended scheduled worker so deadlines are processed even when no user has the app open.

## 8. Security requirements

Every protected operation must validate:

```text
signed-in user
workspace membership
required permission
resource belongs to workspace
```

Workspace A must not be able to read or change Workspace B data.

Relationship checks must also reject cross-workspace services, assignees, tickets, and incidents.

## 9. UX requirements

The product should be easy to understand without a manual.

Important information should be visible quickly:

- issue number
- title
- priority
- status
- service
- owner or assignee
- SLA state
- recent activity

Layouts should work across desktop, tablet, and mobile.

Status should not depend on color alone.

## 10. Quality requirements

Before a release is considered good:

```text
authentication works
workspace isolation works
RBAC works
ticket workflow works
incident workflow works
SLA workflow works
production migration is safe
mobile layout is usable
lint passes
TypeScript passes
tests pass
production build passes
production smoke test passes
```

The project uses:

```bash
npm run check
```

as the main local quality gate.

## 11. Current release scope

Implemented:

```text
Authentication
Workspace multi-tenancy
RBAC
Invitations
Member management
Services
Tickets
Ticket activity
Incident escalation
Incident lifecycle
Incident activity
SLA engine
Responsive production UI
Automated tests
Vercel deployment
Neon PostgreSQL
```

## 12. Not in the current release

These ideas were part of the original larger product plan but are not presented as finished features:

```text
background worker
real-time collaboration
comments
attachments
public REST API
API keys
outbound webhooks
full-text search
immutable security audit log
advanced observability
```

They are possible future improvements, not requirements for the current portfolio release.

## 13. Definition of success

OpsDesk succeeds as a portfolio project when someone can open the product and see more than a styled CRUD dashboard.

The project should demonstrate:

- secure multi-tenancy
- server-side authorization
- realistic operational workflows
- transactional data changes
- historical activity
- SLA business logic
- automated tests
- production deployment

The goal is a smaller product that is complete and understandable, not a huge design document that claims features the app does not actually ship.
