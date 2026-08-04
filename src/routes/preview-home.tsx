import { createFileRoute } from "@tanstack/react-router";

import { DashboardHome } from "@/components/home/DashboardHome";

export const Route = createFileRoute("/preview-home")({
  ssr: false,
  component: DashboardHome,
});
