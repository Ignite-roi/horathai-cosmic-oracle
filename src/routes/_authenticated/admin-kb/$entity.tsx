import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { KB_NAV, KbPageHeader, type KbEntity } from "@/components/kb/AdminKnowledgeShell";
import { KnowledgeTable, type KnowledgeRow } from "@/components/kb/KnowledgeTable";
import { listKbEntities } from "@/lib/kb.functions";

export const Route = createFileRoute("/_authenticated/admin-kb/$entity")({ component: EntityPage });

function EntityPage() {
  const { entity: rawEntity } = Route.useParams();
  const navigate = useNavigate();
  const valid = KB_NAV.some((item) => item.entity === rawEntity);
  const entity = (valid ? rawEntity : "sources") as KbEntity;
  const config = KB_NAV.find((item) => item.entity === entity) ?? KB_NAV[0];
  const fetchEntities = useServerFn(listKbEntities);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(search), 250); return () => window.clearTimeout(timer); }, [search]);
  useEffect(() => setPage(1), [entity, debounced, status]);
  const query = useQuery({ queryKey: ["kb-entities", entity, debounced, status, page], queryFn: () => fetchEntities({ data: { entity, search: debounced, status, page, pageSize: 10 } }), placeholderData: keepPreviousData });
  const rows = useMemo(() => (query.data?.rows ?? []) as KnowledgeRow[], [query.data?.rows]);
  return <><KbPageHeader icon={config.icon} title={config.label} description={descriptionFor(entity)}/><KnowledgeTable rows={rows} count={query.data?.count ?? 0} page={page} pageSize={10} search={search} status={status} loading={query.isLoading} onPage={setPage} onSearch={setSearch} onStatus={setStatus} {...(entity === "sources" ? { onOpenSource: (id: string) => void navigate({ to: "/admin-kb/sources/$sourceId", params: { sourceId: id } }) } : {})}/>{query.error && <p className="mt-3 text-xs text-destructive">{query.error.message}</p>}</>;
}

function descriptionFor(entity: KbEntity): string { const descriptions: Record<KbEntity,string> = { sources: "ทะเบียนแหล่งข้อมูล สิทธิ์ และสถานะการเผยแพร่", documents: "เอกสาร แผนผังหน้า และสถานะ ingestion", rules: "กฎแบบมี version, locator, confidence และ reviewer", review_queue: "คิวกฎที่รอจัดการ conflict และ expert review", conflicts: "ความขัดแย้งระหว่างกฎและคำวินิจฉัยแยกตามสำนัก", schools_systems: "ระบบและสำนักที่ห้ามผสมกันโดยไม่ระบุ", experts: "ผู้ตรวจ ความเชี่ยวชาญ และสถานะยืนยัน", benchmarks: "golden cases และผลเปรียบเทียบ ephemeris อิสระ", astronomy_profiles: "โปรไฟล์เอนจิน ayanamsa timezone และข้อจำกัด", ingestion_jobs: "สถานะ metadata, extraction และข้อจำกัด embedding" }; return descriptions[entity]; }