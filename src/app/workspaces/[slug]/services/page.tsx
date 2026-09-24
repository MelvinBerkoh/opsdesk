import { notFound } from "next/navigation";

import { CreateServiceForm } from "@/features/services/components/create-service-form";
import { ServiceActions } from "@/features/services/components/service-actions";
import { getServicesPageData } from "@/features/services/server/get-services-page-data";
import { WorkspaceShell } from "@/features/workspaces/components/workspace-shell";
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
    <WorkspaceShell
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      role={membership.role}
    >
      <div className="mx-auto max-w-[1450px] px-6 py-8 lg:px-9 lg:py-10">
        <div>
          <p className="text-sm font-semibold text-[#6d5dfc]">
            Service catalog
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171927] lg:text-[38px]">
            Services
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8d909d]">
            Keep track of the systems your team owns and connect
            operational work to the right service.
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6d5dfc]">
              ◇
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {activeServices.length}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Active services
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f8ef] text-[#279565]">
              ✓
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {Math.max(
                workspace.services.length -
                  archivedServices.length,
                0,
              )}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Available for routing
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e8ee] bg-white p-5 shadow-[0_8px_30px_rgba(30,32,54,0.045)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef0f4] text-[#777b87]">
              ↘
            </div>

            <p className="mt-5 text-3xl font-semibold">
              {archivedServices.length}
            </p>

            <p className="mt-1 text-sm text-[#777b87]">
              Archived
            </p>
          </div>
        </section>

        <div
          className={`mt-6 grid gap-6 ${
            canManage
              ? "xl:grid-cols-[1fr_350px]"
              : ""
          }`}
        >
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Service catalog
                </h2>

                <p className="mt-1 text-xs text-[#9a9daa]">
                  Systems currently owned by this workspace.
                </p>
              </div>

              <span className="rounded-full bg-[#eeeaff] px-3 py-1.5 text-xs font-semibold text-[#6d5dfc]">
                {activeServices.length} active
              </span>
            </div>

            {activeServices.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#dfe1e8] bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#6d5dfc]">
                  ◇
                </div>

                <p className="mt-4 font-medium">
                  No services yet
                </p>

                <p className="mt-1 text-sm text-[#9a9daa]">
                  Add the first system your team supports.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeServices.map((service) => (
                  <article
                    key={service.id}
                    className="group rounded-[22px] border border-[#e4e6ed] bg-white p-5 shadow-[0_8px_28px_rgba(37,39,64,0.04)] transition hover:-translate-y-0.5 hover:border-[#d9d4ff] hover:shadow-[0_15px_35px_rgba(37,39,64,0.07)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eeeaff] text-lg text-[#6d5dfc]">
                        ◇
                      </div>

                      <span className="flex items-center gap-2 rounded-full bg-[#eaf8f2] px-2.5 py-1 text-[10px] font-semibold text-[#268e68]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#39bb91]" />
                        ACTIVE
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-tight">
                      {service.name}
                    </h3>

                    <p className="mt-1 text-[11px] font-medium text-[#aaaeba]">
                      {service.slug}
                    </p>

                    <p className="mt-4 min-h-12 text-sm leading-6 text-[#7d808d]">
                      {service.description ||
                        "No description provided."}
                    </p>

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
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-[#626571]">
                    Archived services
                  </h2>

                  <p className="mt-1 text-xs text-[#a0a3ae]">
                    Preserved for historical tickets and
                    incidents.
                  </p>
                </div>

                <div className="overflow-hidden rounded-[22px] border border-[#e4e6ed] bg-white">
                  {archivedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between gap-4 border-b border-[#eff0f4] px-5 py-4 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#777b87]">
                          {service.name}
                        </p>

                        <p className="mt-1 text-xs text-[#aaaeba]">
                          {service.description ||
                            "No description provided."}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#eef0f4] px-2.5 py-1 text-[10px] font-semibold text-[#8c8f9a]">
                        ARCHIVED
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {canManage && (
            <aside>
              <div className="sticky top-28">
                <CreateServiceForm
                  workspaceId={workspace.id}
                  workspaceSlug={workspace.slug}
                />

                <div className="mt-4 rounded-[22px] bg-[#17182b] p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9488ff]">
                    Service routing
                  </p>

                  <p className="mt-3 text-sm font-semibold">
                    Services connect the workflow.
                  </p>

                  <p className="mt-2 text-xs leading-5 text-white/40">
                    Tickets and incidents can both point to a
                    service, making it clear which system is
                    affected.
                  </p>

                  <div className="mt-5 flex items-center justify-between rounded-xl bg-white/[0.06] px-4 py-3 text-xs">
                    <span className="text-white/40">
                      Ticket
                    </span>

                    <span className="text-[#9488ff]">
                      →
                    </span>

                    <span className="text-white/70">
                      Service
                    </span>

                    <span className="text-[#9488ff]">
                      →
                    </span>

                    <span className="text-[#ff8f97]">
                      Incident
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}