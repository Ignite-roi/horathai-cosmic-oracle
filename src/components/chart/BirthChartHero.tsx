import { Link } from "@tanstack/react-router";
import { ArrowLeft, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BirthChartHero({ ascendant, isDemo, temporary = false, privacy = false }: { ascendant?: string; isDemo: boolean; temporary?: boolean; privacy?: boolean }) {
  return (
    <header className="relative pb-5 pt-[max(env(safe-area-inset-top),8px)] text-center">
      <Button asChild variant="outline" size="icon" className="absolute left-0 top-[max(env(safe-area-inset-top),8px)] h-11 w-11 rounded-xl border-primary/35 bg-card/70" aria-label="ย้อนกลับ">
        <Link to="/dashboard"><ArrowLeft /></Link>
      </Button>
      <p className="eyebrow">{privacy ? "Private celestial map" : "Birth chart"}</p>
      <h1 className="thai-heading text-gold mt-1 text-[34px] leading-tight sm:text-[42px]">ดวงกำเนิด</h1>
      <div className="mt-3 flex justify-center">
        <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/35 bg-card/75 px-4 py-2 text-xs text-primary">
          <Compass className="h-4 w-4" /> {ascendant ? `ลัคนาราศี${ascendant}` : "ยังไม่ทราบลัคนา"}{temporary ? " · ดวงชั่วคราว" : ""}
        </span>
      </div>
      <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-foreground/75">
        {privacy ? "ข้อมูลระบุตัวตนถูกซ่อนสำหรับการแชร์" : isDemo ? "ตัวอย่างจักรวาลดวงชะตา — ผูกดวงจริงเพื่อดูข้อมูลเฉพาะคุณ" : "แผนที่จักรวาล ณ ขณะแรกของชีวิตคุณ จากข้อมูลเกิดที่บันทึกไว้"}
      </p>
      <div className="mx-auto mt-5 h-px w-4/5 bg-linear-to-r from-transparent via-primary/55 to-transparent" />
    </header>
  );
}

export type ChartMode = "natal" | "transit" | "both";
export function BirthChartTabs({ value, onChange }: { value: ChartMode; onChange: (mode: ChartMode) => void }) {
  return (
    <div className="grid grid-cols-3 rounded-full border border-primary/45 bg-void/80 p-1" role="tablist" aria-label="เลือกประเภทผังดวง">
      {([['natal','ดวงกำเนิด'],['transit','ดาวจร'],['both','ซ้อนกัน']] as const).map(([id, label]) => (
        <Button key={id} variant="ghost" role="tab" aria-selected={value === id} onClick={() => onChange(id)} className={`h-11 rounded-full text-[13px] ${value === id ? "gold-metal text-primary-foreground hover:text-primary-foreground" : "text-foreground/65 hover:bg-primary/8 hover:text-foreground"}`}>{label}</Button>
      ))}
    </div>
  );
}