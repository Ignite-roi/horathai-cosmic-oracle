import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path kept alive for LINE rich-menu links. */
export const Route = createFileRoute("/transit")({
  beforeLoad: () => {
    throw redirect({ to: "/transits", replace: true });
  },
});
