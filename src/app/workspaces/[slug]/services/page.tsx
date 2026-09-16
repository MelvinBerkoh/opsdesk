import { notFound } from "next/navigation";

import { CreateServiceForm } from "@/features/services/components/create-service-form";
import { ServiceActions } from "@/features/services/components/service-actions";
import { getServicesPageData } from "@/features/services/server/get-services-page-data";
import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav";
import { hasWorkspacePermission } from "@/server/authorization/workspace-permissions";

type ServicesPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ServicesPage({
  params,
}: ServicesPageProps) {
  const { slug } = await params;

  const data = await getServicesPageData(slug);

  if (!data) {
    notFound();
  }

  const { workspace, membership } = data;

  const canManage = hasWorkspacePermission(
    membership.role,
    "services:manage",
  );

  const activeServices = workspace.services.filter(
    (service) => !service.archivedAt,
  );

  const archivedServices = workspace.services.filter(
    (service) => service.archivedAt,
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-sm text-zinc-500">
            OpsDesk Workspace
          </p>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              {workspace.name}
            </h1>

            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
              {membership.role}
            </span>
          </div>
        </div>
      </header>

      <WorkspaceNav workspaceSlug={workspace.slug} />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Operations
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Services
          </h2>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Track the systems and products your team supports.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Active services
              </h3>

              <span className="text-sm text-zinc-500">
                {activeServices.length}
              </span>
            </div>

            {activeServices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-10 text-sm text-zinc-500">
                No services yet. Add the first system your
                team supports.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {activeServices.map((service) => (
                  <article
                    key={service.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                  >
                    <div>
                      <h4 className="font-semibold">
                        {service.name}
                      </h4>

                      <p className="mt-1 text-xs text-zinc-600">
                        {service.slug}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {service.description ||
                          "No description provided."}
                      </p>
                    </div>

                    {canManage && (
                      <ServiceActions
                        workspaceId={workspace.id}
                        workspaceSlug={workspace.slug}
                        service={service}
                      />
                    )}
                  </article>
                ))}
              </div>
            )}

            {archivedServices.length > 0 && (
              <section className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-400">
                    Archived
                  </h3>

                  <span className="text-sm text-zinc-600">
                    {archivedServices.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {archivedServices.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 opacity-70"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-zinc-400">
                            {service.name}
                          </p>

                          <p className="mt-1 text-sm text-zinc-600">
                            {service.description ||
                              "No description provided."}
                          </p>
                        </div>

                        <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-600">
                          Archived
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {canManage && (
            <aside>
              <CreateServiceForm
                workspaceId={workspace.id}
                workspaceSlug={workspace.slug}
              />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}