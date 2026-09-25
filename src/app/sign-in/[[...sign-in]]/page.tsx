import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import { OpsDeskLogo } from "@/components/brand/opsdesk-logo";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your OpsDesk workspace.",
};

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#f5f6fb] text-[#171927]">
      <div className="grid min-h-screen min-[900px]:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#17182b] text-white min-[900px]:flex min-[900px]:flex-col">
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
              aria-label="OpsDesk home"
              className="w-fit transition-opacity hover:opacity-90"
            >
              <OpsDeskLogo
                size={44}
                showWordmark
                subtitle
              />
            </Link>

            <div className="my-auto max-w-xl py-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#5ed3ad]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  Back to operations
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] xl:text-6xl">
                Your workspace is
                <span className="block text-[#9e93ff]">
                  right where you left it.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-white/45 xl:text-base">
                Jump back into your support queue, services,
                incidents, and activity history without losing
                context.
              </p>

              <div className="mt-10 rounded-[24px] border border-white/[0.09] bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
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
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/25">
              <span>OpsDesk © 2026</span>

              <span>Support · Services · Incidents</span>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#f5f6fb]">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#6d5dfc]/10 blur-[100px]" />

          <div className="absolute -bottom-40 left-[-120px] h-96 w-96 rounded-full bg-[#48cba5]/8 blur-[110px]" />

          <header className="relative z-10 flex h-20 items-center justify-between border-b border-[#e7e8ee] bg-white/65 px-6 backdrop-blur-xl min-[900px]:hidden">
            <Link
              href="/"
              aria-label="OpsDesk home"
            >
              <OpsDeskLogo
                size={38}
                showWordmark
                subtitle
              />
            </Link>

            <Link
              href="/sign-up"
              className="rounded-xl border border-[#e1e3eb] bg-white px-4 py-2 text-xs font-semibold text-[#565967] transition hover:border-[#d4cffc] hover:text-[#6d5dfc]"
            >
              Create account
            </Link>
          </header>

          <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
            <div className="w-full max-w-[460px]">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#dedafc] bg-[#f0edff] px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#6d5dfc]" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#6d5dfc]">
                    Workspace access
                  </span>
                </div>

                <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em]">
                  Welcome back
                </h1>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#8a8d99]">
                  Sign in and continue where your team left off.
                </p>
              </div>

              <SignIn
                appearance={{
                  variables: {
                    colorPrimary: "#6d5dfc",
                    colorPrimaryForeground: "#ffffff",
                    colorBackground: "#ffffff",
                    colorForeground: "#171927",
                    colorMutedForeground: "#8a8d99",
                    colorInput: "#fafbfc",
                    colorInputForeground: "#171927",
                    colorBorder: "#e1e3eb",
                    colorRing: "#6d5dfc",
                    borderRadius: "0.85rem",
                    spacing: "1rem",
                  },

                  elements: {
                    rootBox: "w-full",
                    cardBox:
                      "w-full bg-transparent shadow-none",
                    card:
                      "w-full rounded-[26px] border border-[#e1e3eb] bg-white p-6 shadow-[0_24px_70px_rgba(37,39,64,0.10)] sm:p-8",

                    headerTitle: "hidden",
                    headerSubtitle: "hidden",

                    socialButtonsBlockButton:
                      "h-12 border-[#e1e3eb] bg-white shadow-none",
                    socialButtonsBlockButtonText:
                      "text-sm font-medium",

                    dividerLine: "bg-[#eceef3]",
                    dividerText:
                      "text-xs text-[#9a9daa]",

                    formFieldLabel:
                      "text-xs font-semibold text-[#555966]",
                    formFieldInput:
                      "h-12 bg-[#fafbfc] shadow-none",

                    formButtonPrimary:
                      "h-12 text-sm font-semibold shadow-lg shadow-[#6d5dfc]/20",

                    formFieldAction:
                      "font-medium text-[#6d5dfc]",

                    footer:
                      "bg-transparent",
                    footerAction:
                      "text-sm",
                    footerActionLink:
                      "font-semibold text-[#6d5dfc]",

                    identityPreview:
                      "border border-[#e4e6ed] bg-[#fafbfc]",
                    identityPreviewText:
                      "text-[#555966]",
                    identityPreviewEditButton:
                      "text-[#6d5dfc]",

                    alert:
                      "border border-red-200 bg-red-50",
                    alertText:
                      "text-red-600",
                  },
                }}
              />

              <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#a0a3ae]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#41bd94]" />

                Secure access to your OpsDesk workspace
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}