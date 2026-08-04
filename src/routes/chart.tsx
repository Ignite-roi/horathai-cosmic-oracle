import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path kept alive for LINE rich-menu links. */
export const Route = createFileRoute("/chart")({
  beforeLoad: () => {
    throw redirect({ to: "/birth-chart", replace: true });
  },
});
