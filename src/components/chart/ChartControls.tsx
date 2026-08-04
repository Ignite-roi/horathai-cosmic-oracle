import { Eye, EyeOff, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ChartView = "orbit" | "zodiac";
export function ChartControls({ aspects, names, view, privacy, transitDate, showTransitDate, onAspects, onNames, onView, onPrivacy, onTransitDate, onReset }: { aspects: boolean; names: boolean; view: ChartView; privacy: boolean; transitDate: string; showTransitDate: boolean; onAspects: (value: boolean) => void; onNames: (value: boolean) => void; onView: (value: ChartView) => void; onPrivacy: (value: boolean) => void; onTransitDate: (value: string) => void; onReset: () => void }) {
  return (
    <div className="mt-3 space-y-2" aria-label="ตัวควบคุมผังดวง">
      <div className="grid grid-cols-2 gap-2">
        <Button variant={aspects ? "secondary" : "outline"} onClick={() => onAspects(!aspects)} className="h-11 rounded-xl text-xs">{aspects ? "✓ " : ""}เส้นมุมสัมพันธ์</Button>
        <Button variant={names ? "secondary" : "outline"} onClick={() => onNames(!names)} className="h-11 rounded-xl text-xs">{names ? "ชื่อเต็มดาว" : "ชื่อย่อดาว"}</Button>
      </div>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <Button variant={view === "orbit" ? "secondary" : "outline"} onClick={() => onView("orbit")} className="h-11 rounded-xl px-2 text-xs">วงโคจร</Button>
        <Button variant={view === "zodiac" ? "secondary" : "outline"} onClick={() => onView("zodiac")} className="h-11 rounded-xl px-2 text-xs">ผังราศี</Button>
        <Button variant="outline" size="icon" onClick={onReset} className="h-11 w-11 rounded-xl" title="รีเซ็ตมุมมอง"><RotateCcw /></Button>
      </div>
      {showTransitDate && <label className="surface-inset block px-3 py-2 text-[10px] text-muted-foreground">วันและเวลาดาวจร<input type="datetime-local" value={transitDate} onChange={(event) => onTransitDate(event.target.value)} className="mt-1 block h-10 w-full bg-transparent text-sm text-foreground outline-none [color-scheme:dark]"/></label>}
      <Button variant={privacy ? "secondary" : "outline"} onClick={() => onPrivacy(!privacy)} className="h-11 w-full rounded-xl text-xs">{privacy ? <EyeOff/> : <Eye/>}{privacy ? "โหมดแชร์แบบปกปิดข้อมูล" : "เปิดโหมดแชร์แบบปกปิดข้อมูล"}</Button>
    </div>
  );
}