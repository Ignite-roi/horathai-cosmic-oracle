import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CircleHelp, Hash, Sparkles } from "lucide-react";
import { useState } from "react";

import { AppShell, PageTransition } from "@/components/AppShell";
import { HowToUseSheet } from "@/components/insights/HowToUseSheet";
import { Button } from "@/components/ui/button";
import { useLineAuth } from "@/context/LineAuthContext";
import type { CardDraw, CardKind } from "@/lib/social.features";
import { drawDailyCard } from "@/lib/social.functions";

export const Route = createFileRoute("/_authenticated/tools")({ head: () => ({ meta: [
  { title: "ไพ่คำตอบและเลขมงคล | Horathai AI" },
  { name: "description", content: "เครื่องมือสะท้อนตนเองจากกฎที่เผยแพร่ พร้อม citation จำกัดวันละหนึ่งครั้ง" },
  { property: "og:title", content: "ไพ่คำตอบและเลขมงคล | Horathai AI" },
  { property: "og:description", content: "เปิดไพ่ YES/NO และเลขมงคลสามหลักอย่างมีสติ" },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
] }), component: ToolsPage });

function ToolsPage() {
  const { isSignedIn, login } = useLineAuth();
  const draw = useServerFn(drawDailyCard);
  const [result, setResult] = useState<CardDraw | null>(null);
  const [busy, setBusy] = useState<CardKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const open = async (kind: CardKind) => { if (!isSignedIn) return void login(); setBusy(kind); setError(null); try { setResult(await draw({ data: { kind } })); } catch (e) { setError(e instanceof Error ? e.message : "เปิดไพ่ไม่สำเร็จ"); } finally { setBusy(null); } };
  return <AppShell><PageTransition><header className="flex items-start justify-between gap-3"><div><p className="eyebrow">Reflection tools</p><h1 className="display mt-1 text-2xl text-gold">ไพ่ประจำวัน</h1><p className="mt-1 text-xs text-muted-foreground">แต่ละชนิดเปิดได้วันละ 1 ครั้ง</p></div><HowToUseSheet title="ใช้ไพ่อย่างไร"><p>ตั้งคำถามที่ตอบได้ด้วยการทบทวน แล้วเปิดไพ่เพื่อนำข้อความไปพิจารณา ไม่ใช่ใช้แทนการตัดสินใจสำคัญ</p><p>เลขสามหลักเป็นสัญลักษณ์ ไม่ใช่เลขพนันหรือการรับประกันโชคลาภ</p></HowToUseSheet></header><div className="mt-5 grid grid-cols-2 gap-3"><ToolCard icon={CircleHelp} title="ไพ่ YES / NO" text="คำตอบพร้อมคำถามสะท้อน" busy={busy === "yes_no"} onClick={() => void open("yes_no")}/><ToolCard icon={Hash} title="เลขมงคล 3 หลัก" text="สัญลักษณ์ดาวสามตำแหน่ง" busy={busy === "lucky_number"} onClick={() => void open("lucky_number")}/></div>{error && <p className="mt-4 text-center text-xs text-destructive">{error}</p>}{result && <CardResult data={result}/>}</PageTransition></AppShell>;
}
function ToolCard({ icon: Icon, title, text, busy, onClick }: { icon: typeof Sparkles; title: string; text: string; busy: boolean; onClick: () => void }) { return <Button variant="outline" className="surface-card h-40 flex-col whitespace-normal p-4 text-center" disabled={busy} onClick={onClick}><Icon className="h-7 w-7 text-primary"/><strong className="mt-3 text-sm text-gold">{title}</strong><span className="mt-1 text-[10px] text-muted-foreground">{busy ? "กำลังเปิด…" : text}</span></Button>; }
function CardResult({ data }: { data: CardDraw }) { const result = data.result && typeof data.result === "object" && !Array.isArray(data.result) ? data.result : {}; return <section className="surface-hero grain mt-5 p-6 text-center"><Sparkles className="mx-auto h-6 w-6 text-primary"/><p className="mt-4 text-3xl text-gold">{String(result["answer"] ?? result["number"] ?? "")}</p><p className="mt-3 text-sm">{String(result["symbol"] ?? "")}</p><p className="mt-3 text-xs leading-6 text-muted-foreground">{String(result["reflection"] ?? result["disclaimer"] ?? "")}</p><footer className="mt-5 border-t border-border pt-4 text-left text-[10px] leading-5 text-muted-foreground"><p>กฎ {data.ruleCode} · ความเชื่อมั่นเชิงบรรณาธิการ {Math.round(data.confidence * 100)}%</p>{data.citations.map((c) => <p key={c.locator}>อ้างอิง: {c.title} — {c.locator}</p>)}<p>{data.limitations[0]}</p></footer></section>; }