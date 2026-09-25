import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpsDesk",
    short_name: "OpsDesk",
    description:
      "Support ticket and incident response operations in one connected workspace.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#17182b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}