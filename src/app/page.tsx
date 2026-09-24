import Link from "next/link";

const workflowSteps = [
  {
    number: "01",
    title: "Report",
    description:
      "Capture the issue with priority, service, context, and ownership.",
  },
  {
    number: "02",
    title: "Respond",
    description:
      "Move work through the queue while every important change is recorded.",
  },
  {
    number: "03",
    title: "Escalate",
    description:
      "Turn a serious ticket into an incident without losing its history.",
  },
];

const features = [
  {
    label: "Multi-tenant",
    title: "Separate teams. Separate data.",
    description:
      "Every workspace gets its own members, services, tickets, incidents, and permissions.",
  },
  {
    label: "RBAC",
    title: "Control who can do what.",
    description:
      "Owner, admin, agent, and viewer roles protect workspace operations at the server layer.",
  },
  {
    label: "Activity",
    title: "Know exactly what changed.",
    description:
      "Status, priority, ownership, and service changes become part of the operational timeline.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-[#171927]">
      <section className="relative overflow-hidden bg-[#17182b] text-white">
        <div className="absolute inset-0">
          <div className="absolute -left-52 -top-52 h-[600px] w-[600px] rounded-full bg-[#6d5dfc]/25 blur-[120px]" />
          <div className="absolute right-[-180px] top-20 h-[520px] w-[520px] rounded-full bg-[#4c9cff]/15 blur-[120px]" />
          <div className="absolute bottom-[-260px] left-[35%] h-[520px] w-[520px] rounded-full bg-[#3427aa]/30 blur-[100px]" />

          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <header className="relative z-20">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6d5dfc] text-sm font-bold shadow-lg shadow-black/20">
                OD
              </div>

              <div>
                <p className="text-base font-semibold tracking-tight">
                  OpsDesk
                </p>

                <p className="text-[10px] text-white/40">
                  Operations Platform
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-white/50 md:flex">
              <a
                href="#workflow"
                className="transition hover:text-white"
              >
                Workflow
              </a>

              <a
                href="#platform"
                className="transition hover:text-white"
              >
                Platform
              </a>

              <a
                href="#features"
                className="transition hover:text-white"
              >
                Features
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="hidden px-3 py-2 text-sm font-medium text-white/60 transition hover:text-white sm:block"
              >
                Sign in
              </Link>

              <Link
                href="/dashboard"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#17182b] shadow-lg transition hover:-translate-y-0.5"
              >
                Open OpsDesk
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[670px] max-w-7xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:pb-24 lg:pt-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-white/65 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#5ce0b0] shadow-[0_0_10px_rgba(92,224,176,0.7)]" />
              Engineering operations, connected
            </div>

            <h1 className="mt-7 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[70px]">
              Incident response,
              <span className="block text-[#9e93ff]">
                without the scramble.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/55 sm:text-lg">
              Manage support tickets, service ownership,
              escalations, and incidents from one operational
              workspace.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-xl bg-[#6d5dfc] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-xl shadow-[#6d5dfc]/20 transition hover:-translate-y-0.5 hover:bg-[#5f50eb]"
              >
                Enter workspace →
              </Link>

              <a
                href="#workflow"
                className="rounded-xl border border-white/10 bg-white/[0.055] px-6 py-3.5 text-center text-sm font-medium text-white/70 backdrop-blur transition hover:bg-white/[0.09] hover:text-white"
              >
                See the workflow
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/35">
              <span>Multi-tenant</span>
              <span>Role-based access</span>
              <span>Activity timelines</span>
              <span>Ticket escalation</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[650px]">
            <div className="absolute -inset-8 rounded-[60px] bg-[#6655ff]/10 blur-3xl" />

            <div className="relative rounded-[28px] border border-white/10 bg-[#0e1020]/80 p-4 shadow-[0_40px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                    Live operations board
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#54dca9] shadow-[0_0_10px_rgba(84,220,169,0.7)]" />

                    <span className="text-xs text-white/60">
                      Workspace operational
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[10px] text-white/35">
                  MELVIN ENGINEERING
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[0.92fr_72px_1.08fr] lg:items-center">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.055] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9e93ff]">
                        Support ticket
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        TKT-0142
                      </p>
                    </div>

                    <span className="rounded-full bg-[#ffb74f]/10 px-2.5 py-1 text-[9px] font-bold text-[#ffc66e]">
                      P1 · HIGH
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    Checkout payments failing
                  </h3>

                  <p className="mt-3 text-xs leading-5 text-white/40">
                    Customers receive an authorization error
                    during checkout.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/30">
                        SERVICE
                      </span>

                      <span className="text-white/65">
                        Payments API
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/30">
                        ASSIGNEE
                      </span>

                      <span className="text-white/65">
                        Engineering
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/30">
                        STATUS
                      </span>

                      <span className="rounded-full bg-[#7264ff]/15 px-2 py-1 text-[#a99fff]">
                        IN PROGRESS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative hidden h-full items-center justify-center lg:flex">
                  <div className="absolute h-[72%] w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#7164ff]/35 bg-[#211d4c] text-[#9e93ff] shadow-[0_0_30px_rgba(109,93,252,0.25)]">
                    →
                  </div>

                  <div className="absolute left-1/2 top-[27%] -translate-x-1/2 rounded-full border border-[#7164ff]/20 bg-[#17182b] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#8f85eb]">
                    Escalate
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-[#ef5d67]/20 bg-[#231621] p-5">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#ef5d67]/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#ff8e96]">
                          Incident
                        </p>

                        <p className="mt-2 text-sm font-semibold">
                          INC-0042
                        </p>
                      </div>

                      <span className="rounded-full bg-[#ef5d67]/15 px-2.5 py-1 text-[9px] font-bold text-[#ff8e96]">
                        P0 · CRITICAL
                      </span>
                    </div>

                    <h3 className="mt-6 text-lg font-semibold">
                      Payments outage
                    </h3>

                    <p className="mt-3 text-xs leading-5 text-white/40">
                      Checkout failures escalated into coordinated
                      incident response.
                    </p>

                    <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/30">
                          RESPONSE STATE
                        </span>

                        <span className="flex items-center gap-2 text-[10px] text-[#ff9aa1]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ef5d67]" />
                          INVESTIGATING
                        </span>
                      </div>

                      <div className="mt-5 space-y-4">
                        <div className="flex gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-[#6d5dfc]" />

                          <div>
                            <p className="text-[10px] text-white/65">
                              Incident created
                            </p>

                            <p className="mt-1 text-[9px] text-white/25">
                              3:42 PM
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-[#5ce0b0]" />

                          <div>
                            <p className="text-[10px] text-white/65">
                              Owner assigned
                            </p>

                            <p className="mt-1 text-[9px] text-white/25">
                              3:44 PM
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-[#ffb74f]" />

                          <div>
                            <p className="text-[10px] text-white/65">
                              Status → Investigating
                            </p>

                            <p className="mt-1 text-[9px] text-white/25">
                              3:48 PM
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.035] p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/25">
                    Queue health
                  </p>

                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-2xl font-semibold">
                      94%
                    </span>

                    <span className="text-xs text-[#5ce0b0]">
                      Healthy
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.035] p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/25">
                    Ownership
                  </p>

                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-2xl font-semibold">
                      12
                    </span>

                    <span className="text-xs text-white/30">
                      assigned
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.035] p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/25">
                    Active incidents
                  </p>

                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-2xl font-semibold">
                      02
                    </span>

                    <span className="text-xs text-[#ff8e96]">
                      1 critical
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e7e8ee] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 sm:grid-cols-4">
          {[
            ["TICKETS", "Structured support queue"],
            ["SERVICES", "Operational ownership"],
            ["INCIDENTS", "Coordinated response"],
            ["HISTORY", "Every change recorded"],
          ].map(([label, description], index) => (
            <div
              key={label}
              className={`py-7 ${
                index !== 3
                  ? "sm:border-r sm:border-[#eceef3]"
                  : ""
              } ${index % 2 === 0 ? "pr-4" : "pl-4"}`}
            >
              <p className="text-[10px] font-bold tracking-[0.17em] text-[#6d5dfc]">
                {label}
              </p>

              <p className="mt-2 text-xs text-[#9497a3]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="workflow"
        className="px-6 py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="text-sm font-semibold text-[#6d5dfc]">
                One connected workflow
              </p>

              <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                From first report to final resolution.
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-[#858894] lg:justify-self-end">
              The issue doesn&apos;t disappear when it becomes
              serious. OpsDesk preserves the relationship between
              the support ticket, affected service, responders,
              and incident history.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step.number}
                className={`relative overflow-hidden rounded-[26px] p-7 ${
                  index === 1
                    ? "bg-[#6d5dfc] text-white shadow-xl shadow-[#6d5dfc]/15"
                    : "border border-[#e5e7ee] bg-white"
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    index === 1
                      ? "text-white/55"
                      : "text-[#6d5dfc]"
                  }`}
                >
                  {step.number}
                </span>

                <div
                  className={`mt-14 flex h-11 w-11 items-center justify-center rounded-xl ${
                    index === 1
                      ? "bg-white/15"
                      : "bg-[#eeeaff] text-[#6d5dfc]"
                  }`}
                >
                  {index === 0
                    ? "+"
                    : index === 1
                      ? "↻"
                      : "↑"}
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {step.title}
                </h3>

                <p
                  className={`mt-3 text-sm leading-6 ${
                    index === 1
                      ? "text-white/60"
                      : "text-[#898c98]"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="platform"
        className="bg-white px-6 py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-[#6d5dfc]">
              Everything stays connected
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Operational context shouldn&apos;t disappear between tools.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#858894]">
              Ticket ownership, service relationships, incident
              escalation, status transitions, and audit history
              live together inside the same workspace.
            </p>

            <Link
              href="/dashboard"
              className="mt-8 inline-flex rounded-xl bg-[#17182b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#292a40]"
            >
              Explore the workspace →
            </Link>
          </div>

          <div className="rounded-[30px] bg-[#f3f4f9] p-5 sm:p-8">
            <div className="rounded-2xl bg-white p-6 shadow-[0_15px_45px_rgba(30,32,54,0.08)]">
              <div className="flex items-center justify-between border-b border-[#eff0f4] pb-5">
                <div>
                  <p className="text-xs font-semibold text-[#6d5dfc]">
                    INC-0042
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    Payments outage
                  </p>
                </div>

                <span className="rounded-full bg-[#ffe8e9] px-3 py-1 text-xs font-semibold text-[#e6535e]">
                  P0
                </span>
              </div>

              <div className="mt-6 space-y-5">
                {[
                  [
                    "Ticket escalated",
                    "TKT-0142 linked to incident",
                    "#6d5dfc",
                  ],
                  [
                    "Incident owner",
                    "Engineering assigned",
                    "#35b992",
                  ],
                  [
                    "Response state",
                    "Investigating",
                    "#f0a12b",
                  ],
                  [
                    "Latest update",
                    "Payment processor degradation confirmed",
                    "#ef5d67",
                  ],
                ].map(([title, text, color]) => (
                  <div
                    key={title}
                    className="flex gap-4"
                  >
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: color,
                      }}
                    />

                    <div>
                      <p className="text-xs font-semibold text-[#343643]">
                        {title}
                      </p>

                      <p className="mt-1 text-xs text-[#979aa6]">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#6d5dfc]">
              Built into the foundation
            </p>

            <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.045em]">
              More than another ticket dashboard.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="rounded-[24px] border border-[#e5e7ee] bg-white p-7"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#6d5dfc]">
                  {feature.label}
                </span>

                <h3 className="mt-8 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#888b97]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-[#6d5dfc] px-8 py-16 text-white sm:px-12 lg:px-16">
          <div className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-[#31258f]/30 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-9 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-medium text-white/55">
                The queue is waiting.
              </p>

              <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.045em]">
                Run support and incident response from one place.
              </h2>
            </div>

            <Link
              href="/dashboard"
              className="shrink-0 rounded-xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-[#5b4bea] shadow-xl"
            >
              Open OpsDesk →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e7e8ee] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-9 text-xs text-[#979aa5] sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6d5dfc] text-[10px] font-bold text-white">
              OD
            </div>

            <span>OpsDesk</span>
          </div>

          <span>
            Support · Services · Incident response
          </span>
        </div>
      </footer>
    </main>
  );
}