import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AdminKnowledgeShell } from "@/components/kb/AdminKnowledgeShell";
import { getKbAccess } from "@/lib/kb.functions";

export const Route = createFileRoute("/_authenticated/admin-kb" as never)({
  head: () => ({ meta: [{ title: "Knowledge Governance | Horathai" }, { name: "description", content: "แดชบอร์ดกำกับแหล่งอ้างอิงและกฎโหราศาสตร์ไทย" }, { property: "og:title", content: "Knowledge Governance | Horathai" }, { property: "og:description", content: "ระบบตรวจสอบแหล่ง กฎ ความขัดแย้ง และ benchmark" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminKbLayout,
});

function AdminKbLayout() {
  const fetchAccess = useServerFn(getKbAccess);
  const access = useQuery({ queryKey: ["kb-access"], queryFn: () => fetchAccess(), retry: false });
  if (access.isLoading) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">กำลังตรวจสิทธิ์ Knowledge Governance…</div>;
  if (access.error || !access.data?.canReview) return <div className="grid min-h-screen place-items-center bg-background p-6 text-center"><div><h1 className="text-xl text-foreground">ไม่มีสิทธิ์เข้าถึง</h1><p className="mt-2 text-sm text-muted-foreground">หน้านี้เปิดสำหรับ admin หรือ reviewer ที่ตรวจสอบจาก backend เท่านั้น</p></div></div>;
  return <AdminKnowledgeShell><Outlet/></AdminKnowledgeShell>;
}