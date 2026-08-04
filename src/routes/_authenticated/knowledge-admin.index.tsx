import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/knowledge-admin/")({ component: () => <a href="/knowledge-admin/sources">เปิด Sources</a> });