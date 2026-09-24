-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('P0', 'P1', 'P2', 'P3');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketActivityType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNEE_CHANGED', 'SERVICE_CHANGED', 'COMMENT_ADDED', 'SLA_WARNING', 'SLA_BREACHED', 'RESOLVED', 'CLOSED', 'REOPENED', 'INCIDENT_LINKED');

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'P2',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "service_id" TEXT,
    "reporter_membership_id" TEXT NOT NULL,
    "assignee_membership_id" TEXT,
    "response_deadline" TIMESTAMP(3),
    "resolution_deadline" TIMESTAMP(3),
    "first_response_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "response_warning_at" TIMESTAMP(3),
    "resolution_warning_at" TIMESTAMP(3),
    "response_breached_at" TIMESTAMP(3),
    "resolution_breached_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_activity" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "actor_membership_id" TEXT,
    "type" "TicketActivityType" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tickets_workspace_id_status_idx" ON "tickets"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "tickets_workspace_id_priority_idx" ON "tickets"("workspace_id", "priority");

-- CreateIndex
CREATE INDEX "tickets_workspace_id_assignee_membership_id_idx" ON "tickets"("workspace_id", "assignee_membership_id");

-- CreateIndex
CREATE INDEX "tickets_workspace_id_service_id_idx" ON "tickets"("workspace_id", "service_id");

-- CreateIndex
CREATE INDEX "tickets_workspace_id_created_at_idx" ON "tickets"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "tickets_workspace_id_updated_at_idx" ON "tickets"("workspace_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_workspace_id_number_key" ON "tickets"("workspace_id", "number");

-- CreateIndex
CREATE INDEX "ticket_activity_workspace_id_ticket_id_created_at_idx" ON "ticket_activity"("workspace_id", "ticket_id", "created_at");

-- CreateIndex
CREATE INDEX "ticket_activity_actor_membership_id_idx" ON "ticket_activity"("actor_membership_id");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_reporter_membership_id_fkey" FOREIGN KEY ("reporter_membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_membership_id_fkey" FOREIGN KEY ("assignee_membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_activity" ADD CONSTRAINT "ticket_activity_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_activity" ADD CONSTRAINT "ticket_activity_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_activity" ADD CONSTRAINT "ticket_activity_actor_membership_id_fkey" FOREIGN KEY ("actor_membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
