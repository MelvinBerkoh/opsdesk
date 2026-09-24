-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'MONITORING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "IncidentActivityType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'OWNER_CHANGED', 'SERVICE_CHANGED', 'TICKET_LINKED', 'RESOLVED', 'REOPENED');

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'P1',
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "service_id" TEXT,
    "owner_membership_id" TEXT,
    "source_ticket_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_activity" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "actor_membership_id" TEXT,
    "type" "IncidentActivityType" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "incidents_source_ticket_id_key" ON "incidents"("source_ticket_id");

-- CreateIndex
CREATE INDEX "incidents_workspace_id_status_idx" ON "incidents"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "incidents_workspace_id_priority_idx" ON "incidents"("workspace_id", "priority");

-- CreateIndex
CREATE INDEX "incidents_workspace_id_service_id_idx" ON "incidents"("workspace_id", "service_id");

-- CreateIndex
CREATE INDEX "incidents_workspace_id_owner_membership_id_idx" ON "incidents"("workspace_id", "owner_membership_id");

-- CreateIndex
CREATE INDEX "incidents_workspace_id_created_at_idx" ON "incidents"("workspace_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_workspace_id_number_key" ON "incidents"("workspace_id", "number");

-- CreateIndex
CREATE INDEX "incident_activity_workspace_id_incident_id_created_at_idx" ON "incident_activity"("workspace_id", "incident_id", "created_at");

-- CreateIndex
CREATE INDEX "incident_activity_actor_membership_id_idx" ON "incident_activity"("actor_membership_id");

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_owner_membership_id_fkey" FOREIGN KEY ("owner_membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_source_ticket_id_fkey" FOREIGN KEY ("source_ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_activity" ADD CONSTRAINT "incident_activity_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_activity" ADD CONSTRAINT "incident_activity_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_activity" ADD CONSTRAINT "incident_activity_actor_membership_id_fkey" FOREIGN KEY ("actor_membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
