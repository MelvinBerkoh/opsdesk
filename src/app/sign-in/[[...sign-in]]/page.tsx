import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#f5f6fb] text-[#171927]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT — PRODUCT / BRAND SIDE */}
        <section className="relative hidden overflow-hidden bg-[#17182b] text-white lg:flex lg:flex-col">
          <div className="absolute inset-0">
            <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#6d5dfc]/30 blur-[120px]" />

            <div className="absolute -bottom-56 right-[-100px] h-[540px] w-[540px] rounded-full bg-[#35c59f]/15 blur-[130px]" />

            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-1 flex-col p-10 xl:p-14">
            <Link
              href="/"
              className="flex w-fit items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6d5dfc] text-sm font-bold shadow-lg shadow-black/20">
                OD
              </div>

              <div>
                <p className="text-lg font-semibold tracking-tight">
                  OpsDesk
                </p>

                <p className="text-[10px] text-white/40">
                  Operations Platform
                </p>
              </div>
            </Link>

            <div className="my-auto max-w-xl py-16">
              <p className="text-sm font-medium text-[#9488ff]">
                Back to operations.
              </p>

              <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] xl:text-6xl">
                Pick up exactly
                <span className="block text-[#9e93ff]">
                  where the issue left off.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/45">
                Your support queue, services, incidents, owners,
                and activity history stay connected inside one
                workspace.
              </p>

              <div className="relative mt-12 max-w-lg">
                <div className="rounded-[24px] border border-white/[0.09] bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#988dff]">
                        Active incident
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        INC-0042
                      </p>
                    </div>

                    <span className="rounded-full bg-[#ef5d67]/15 px-3 py-1.5 text-[10px] font-semibold text-[#ff8f97]">
                      P0 · CRITICAL
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-semibold">
                    Checkout payments failing
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/40">
                    Elevated payment authorization failures are
                    impacting customer checkout.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
                      <p className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                        Service
                      </p>

                      <p className="mt-2 text-sm">
                        Payments API
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
                      <p className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                        Owner
                      </p>

                      <p className="mt-2 text-sm">
                        Engineering
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#0d0f1d]/50 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-[#f0a12b] shadow-[0_0_10px_rgba(240,161,43,0.6)]" />

                    <span className="text-xs text-white/55">
                      Investigating
                    </span>

                    <span className="ml-auto text-[10px] text-white/25">
                      updated just now
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-8 -right-8 rounded-2xl bg-[#5ed3ad] px-5 py-4 text-[#123a2f] shadow-xl shadow-black/20">
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#236d59]">
                    Queue health
                  </p>

                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-2xl font-bold">
                      94%
                    </span>

                    <span className="pb-1 text-[10px] text-[#32745f]">
                      assigned
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-white/25">
              <span>OpsDesk © 2026</span>
              <span>Support · Services · Incidents</span>
            </div>
          </div>
        </section>

        {/* RIGHT — AUTH SIDE */}
        <section className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:min-h-0">
          <div className="absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-[#6d5dfc]/8 blur-[90px]" />

          <div className="relative w-full max-w-[440px]">
            <Link
              href="/"
              className="mb-12 flex w-fit items-center gap-3 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6d5dfc] text-sm font-bold text-white">
                OD
              </div>

              <span className="font-semibold">
                OpsDesk
              </span>
            </Link>

            <div className="mb-8">
              <p className="text-sm font-semibold text-[#6d5dfc]">
                Welcome back
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em]">
                Sign in to OpsDesk
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#8a8d99]">
                Continue to your workspace and get back to the
                queue.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#e4e6ed] bg-white p-6 shadow-[0_20px_55px_rgba(37,39,64,0.08)] sm:p-8">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    cardBox:
                      "w-full shadow-none border-0 bg-transparent",
                    card:
                      "w-full shadow-none border-0 bg-transparent p-0",

                    headerTitle: "hidden",
                    headerSubtitle: "hidden",

                    socialButtonsBlockButton:
                      "h-11 rounded-xl border border-[#e2e4ea] bg-white text-[#4f5260] shadow-none hover:bg-[#f8f8fb]",
                    socialButtonsBlockButtonText:
                      "text-sm font-medium",

                    dividerLine: "bg-[#eceef3]",
                    dividerText:
                      "text-xs text-[#a0a3ae]",

                    formFieldLabel:
                      "text-xs font-medium text-[#555966]",
                    formFieldInput:
                      "h-11 rounded-xl border-[#dfe1e8] bg-[#fafbfc] text-[#171927] shadow-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc]",

                    formButtonPrimary:
                      "h-11 rounded-xl bg-[#6d5dfc] text-sm font-semibold shadow-lg shadow-[#6d5dfc]/15 hover:bg-[#5e4fe8]",

                    formFieldAction:
                      "text-[#6d5dfc] hover:text-[#5545d7]",

                    footerActionLink:
                      "font-semibold text-[#6d5dfc] hover:text-[#5545d7]",

                    identityPreview:
                      "rounded-xl border border-[#e4e6ed] bg-[#fafbfc]",
                    identityPreviewText:
                      "text-[#555966]",
                    identityPreviewEditButton:
                      "text-[#6d5dfc]",

                    alert:
                      "rounded-xl border border-red-200 bg-red-50",
                    alertText: "text-red-600",
                  },
                }}
              />
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[#a0a3ae]">
              Protected workspace access powered by Clerk.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}