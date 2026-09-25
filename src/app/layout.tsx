import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";

import "./globals.css";

const description =
  "OpsDesk brings support tickets, service ownership, escalation, and incident response into one connected workspace.";

export const metadata: Metadata = {
  title: {
    default: "OpsDesk",
    template: "%s | OpsDesk",
  },

  description,

  applicationName: "OpsDesk",

  manifest: "/manifest.webmanifest",

  keywords: [
    "support ticket management",
    "incident response",
    "service management",
    "engineering operations",
    "team operations",
  ],

  openGraph: {
    type: "website",
    siteName: "OpsDesk",
    title: "OpsDesk",
    description,
  },

  twitter: {
    card: "summary_large_image",
    title: "OpsDesk",
    description,
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#17182b",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}