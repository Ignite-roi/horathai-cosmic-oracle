import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin-kb/" as never)({ component: () => <a href="/admin-kb/sources">เปิด Sources</a> });