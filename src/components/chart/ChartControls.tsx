import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ChartView = "orbit" | "zodiac";
export function ChartControls({ aspects, names, view, onAspects, onNames, onView, onReset }: { aspects: boolean; names: boolean; view: ChartView; onAspects: (value: boolean) => void; onNames: (value: boolean) => void; onView: (value: ChartView) => void; onReset: () => void }) {
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
    </div>
  );
}