-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "services_workspace_id_archived_at_idx" ON "services"("workspace_id", "archived_at");

-- CreateIndex
CREATE INDEX "services_workspace_id_name_idx" ON "services"("workspace_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "services_workspace_id_slug_key" ON "services"("workspace_id", "slug");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
