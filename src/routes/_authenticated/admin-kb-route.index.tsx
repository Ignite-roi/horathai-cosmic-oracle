import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin-kb-route/")({ component: () => <a href="/admin-kb-route/sources">เปิด Sources</a> });