import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin-kb/")({ component: () => <Navigate to="/admin-kb/sources" replace/> });