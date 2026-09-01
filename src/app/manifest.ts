import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daybook",
    short_name: "Daybook",
    description: "Tasks, notes, calendar alerts and envelope budgeting in one private workspace.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f7f8f5",
    theme_color: "#2e6f5b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
