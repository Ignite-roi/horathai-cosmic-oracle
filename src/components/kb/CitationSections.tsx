import { AlertTriangle, BookOpen, Calculator, CheckCircle2, Scale, Sparkles } from "lucide-react";

import type { GovernedCitation, GovernedRule } from "@/lib/kb-governance";
import { productionEligibleRules } from "@/lib/kb-governance";

export function SourceCitations({ citations }: { citations: GovernedCitation[] }) {
  return <section className="surface-card p-4"><Header icon={BookOpen} label="D" title="แหล่งอ้างอิง"/><div className="mt-3 space-y-2">{citations.length ? citations.map((citation) => <div key={`${citation.ruleId}-${citation.locator}`} className="border-l-2 border-primary/40 pl-3 text-xs leading-5"><p className="text-foreground">{citation.sourceTitle}</p><p className="text-muted-foreground">{citation.author ?? "ไม่ระบุผู้แต่ง"} · {citation.locator} · กฎรุ่น {citation.ruleVersion}</p></div>) : <p className="text-xs text-warning">ยังไม่มี citation ที่ผ่านการเผยแพร่ จึงยังไม่แสดงคำตีความ</p>}</div></section>;
}

export function GovernedReading({ facts, rules, limitations }: { facts: string[]; rules: GovernedRule[]; limitations: string[] }) {
  const eligible = productionEligibleRules(rules);
  const citations = eligible.flatMap((rule) => rule.citations);
  return <section className="mt-8 space-y-3" aria-label="ผลการอ่านดวงแบบมีแหล่งอ้างอิง">
    <section className="surface-card p-4"><Header icon={Calculator} label="A" title="ข้อเท็จจริงจากการคำนวณ"/><ul className="mt-3 space-y-1 text-xs text-foreground/80">{facts.map((fact) => <li key={fact}>• {fact}</li>)}</ul></section>
    <section className="surface-card p-4"><Header icon={Scale} label="B" title="กฎโหราศาสตร์ไทย"/><p className="mt-3 text-xs text-muted-foreground">{eligible.length ? `พบกฎที่เผยแพร่และผ่านเงื่อนไข ${eligible.length} รายการ` : "ยังไม่มีกฎ published ที่มี citation ครบและปลอดข้อขัดแย้ง"}</p></section>
    <section className="surface-card p-4"><Header icon={Sparkles} label="C" title="คำตีความเฉพาะบุคคล"/><p className="mt-3 text-xs leading-6 text-muted-foreground">{eligible.length ? eligible.map((rule) => rule.copyrightSafeWording).join(" ") : "ระบบงดสร้างคำตีความจนกว่ากฎไทยจะผ่านกระบวนการตรวจและเผยแพร่"}</p></section>
    <SourceCitations citations={citations}/>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="surface-card p-4"><Header icon={CheckCircle2} label="E" title="ความเชื่อมั่น"/><p className="mt-3 text-xs text-muted-foreground">{eligible.length ? `${Math.round(Math.min(...eligible.map((rule) => rule.confidence)) * 100)}% ตาม metadata ของกฎ` : "ยังประเมินไม่ได้"}</p></div><div className="surface-card p-4"><Header icon={AlertTriangle} label="F" title="ข้อจำกัด"/><ul className="mt-3 space-y-1 text-xs text-muted-foreground">{limitations.map((item) => <li key={item}>• {item}</li>)}</ul></div></section>
  </section>;
}

function Header({ icon: Icon, label, title }: { icon: typeof BookOpen; label: string; title: string }) {
  return <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md border border-primary/25 text-[10px] text-primary">{label}</span><Icon className="h-4 w-4 text-primary"/><h2 className="text-sm text-foreground">{title}</h2></div>;
}