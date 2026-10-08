import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Link2, MessageCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { LiveUniverse } from "@/components/cosmos/LiveUniverse";
import { Button } from "@/components/ui/button";
import { useLineAuth } from "@/context/LineAuthContext";
import type { PublicShare } from "@/lib/social.features";
import { getPublicResultShare } from "@/lib/social.functions";
import { formatThaiDateTime } from "@/lib/civil-time";
import { NOINDEX_META } from "@/lib/seo";

export const Route = createFileRoute("/r/$token")({
  head: () => ({ meta: [
    { title: "ผลอ่านที่แชร์ | Horathai AI" },
    { name: "description", content: "ผลอ่าน Horathai แบบอ่านอย่างเดียว พร้อมแหล่งอ้างอิงและข้อจำกัด" },
    { property: "og:title", content: "ผลอ่านที่แชร์ | Horathai AI" },
    { property: "og:description", content: "เปิดผลอ่านโหราศาสตร์ที่แชร์อย่างปลอดภัย" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    NOINDEX_META,
  ] }),
  component: SharedResultPage,
});

function SharedResultPage() {
  const { token } = Route.useParams();
  const load = useServerFn(getPublicResultShare);
  const { login } = useLineAuth();
  const [data, setData] = useState<PublicShare | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void load({ data: { token } }).then(setData).catch((e: unknown) => setError(e instanceof Error ? e.message : "เปิดผลอ่านไม่สำเร็จ")); }, [load, token]);
  return <main className="relative min-h-screen overflow-hidden px-5 py-8"><LiveUniverse/><div className="relative z-10 mx-auto max-w-lg"><header className="mb-6 text-center"><p className="eyebrow">Shared reading</p><h1 className="display mt-2 text-2xl text-gold">{data?.title ?? "ผลอ่าน Horathai"}</h1><p className="mt-2 text-xs text-muted-foreground">อ่านอย่างเดียว · ไม่เปิดเผยบัญชีเจ้าของ</p></header>{error && <section className="surface-card p-6 text-center text-sm text-destructive">{error}</section>}{!data && !error && <section className="surface-card h-48 animate-pulse"/>}{data && <><section className="surface-hero grain p-5"><div className="flex items-center gap-2 text-xs text-primary"><ShieldCheck className="h-4 w-4"/> ข้อมูล snapshot ณ เวลาที่แชร์</div><JsonSummary value={data.payload}/><p className="mt-4 border-t border-border pt-3 text-[10px] text-muted-foreground">ลิงก์หมดอายุ {formatThaiDateTime(data.expiresAt)}</p></section><Button className="btn-gold mt-5 h-12 w-full gap-2" onClick={() => void login()}><MessageCircle className="h-4 w-4"/> เชื่อม LINE เพื่อดูดวงตัวเอง</Button><p className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground"><Link2 className="h-3 w-3"/> เจ้าของสามารถเพิกถอนลิงก์ได้ทุกเมื่อ</p></>}</div></main>;
}

function JsonSummary({ value }: { value: PublicShare["payload"] }) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return <p className="mt-4 text-sm">{String(value ?? "")}</p>;
  const preferred = ["overall", "scores", "colors", "dimensions", "ascendant_json", "planets_json", "evidence"];
  const entries = Object.entries(value).filter(([key]) => preferred.includes(key)).slice(0, 6);
  return <div className="mt-5 space-y-3">{entries.map(([key, item]) => <div key={key} className="surface-inset p-4"><p className="eyebrow">{key}</p><pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-foreground/80">{JSON.stringify(item, null, 2)}</pre></div>)}</div>;
}