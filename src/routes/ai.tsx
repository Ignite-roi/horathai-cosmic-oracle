import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path kept alive for LINE rich-menu links. */
export const Route = createFileRoute("/ai")({
  beforeLoad: () => {
    throw redirect({ to: "/ai-astrologer", replace: true });
  },
});
