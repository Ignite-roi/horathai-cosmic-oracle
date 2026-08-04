import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell, PageTransition } from "@/components/AppShell";
import { HowToUseSheet } from "@/components/insights/HowToUseSheet";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSession } from "@/hooks/useAuth";
import { readGuestBirthContext } from "@/lib/guest-birth";
import { buddhistDate, guestContextToBirth } from "@/lib/insights.client";
import { getGuestCalendar, getMyCalendar } from "@/lib/insights.functions";
import type { CalendarDay } from "@/lib/insights.types";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "ปฏิทินวันดี 6 เดือน | Horathai AI" },
      { name: "description", content: "ปฏิทินจังหวะดาวจรล่วงหน้า 6 เดือน เทียบดวงกำเนิดรายบุคคล" },
      { property: "og:title", content: "ปฏิทินวันดี 6 เดือน | Horathai AI" },
      {
        property: "og:description",
        content: "สำรวจวันมหาเฮง วันเฮง และวันที่ควรวางแผนอย่างรอบคอบ",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

const tone: Record<string, string> = {
  วันมหาเฮง: "bg-primary text-primary-foreground",
  วันเฮง: "bg-success/20 text-success",
  ปกติ: "bg-muted text-muted-foreground",
  วันควรระวัง: "bg-destructive/15 text-destructive",
};
function CalendarPage() {
  const { session, loading } = useSession();
  const guest = typeof window === "undefined" ? null : readGuestBirthContext();
  const mine = useServerFn(getMyCalendar);
  const publicFn = useServerFn(getGuestCalendar);
  const start = new Date().toISOString().slice(0, 8) + "01";
  const query = useQuery({
    queryKey: ["six-month-calendar", session?.user.id ?? "guest", start],
    enabled: !loading && Boolean(session || guest),
    queryFn: () =>
      session
        ? mine({ data: { start } })
        : publicFn({ data: { birth: guestContextToBirth(guest!), start } }),
    staleTime: 6 * 60 * 60 * 1000,
  });
  const [month, setMonth] = useState(0);
  const [selected, setSelected] = useState<CalendarDay | null>(null);
  const groups = useMemo(() => {
    const map = new Map<string, CalendarDay[]>();
    for (const day of query.data?.days ?? []) {
      const key = day.date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), day]);
    }
    return [...map.entries()].slice(0, 6);
  }, [query.data]);
  const current = groups[month];
  const firstOffset = current ? new Date(`${current[0]}-01T00:00:00Z`).getUTCDay() : 0;
  return (
    <AppShell>
      <PageTransition>
        <div className="space-y-5 pb-8">
          <header className="flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow">Six-month orbit</p>
              <h1 className="display mt-1 text-2xl text-gold">ปฏิทินวันดี วันร้าย</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                ดาวจรเทียบดวงกำเนิด · ล่วงหน้า 6 เดือน
              </p>
            </div>
            <HowToUseSheet title="อ่านปฏิทินอย่างไร">
              <p>
                ระดับวันมาจากคะแนนรวม 6 ด้านตามเกณฑ์ในกฎที่เผยแพร่
                กดวันที่เพื่อดูคะแนนรายด้านและเหตุผลจากดาว
              </p>
              <p>ใช้เป็นเครื่องมือวางแผนเชิงสะท้อน ไม่ใช่เหตุผลเดียวในการตัดสินใจเรื่องสำคัญ</p>
            </HowToUseSheet>
          </header>
          {!session && !guest && (
            <section className="surface-card p-5 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-[var(--gold)]" />
              <p className="mt-3 text-sm">ผูกดวงก่อนเพื่อสร้างปฏิทินเฉพาะบุคคล</p>
              <Button asChild className="mt-4">
                <Link to="/onboarding">กรอกข้อมูลเกิด</Link>
              </Button>
            </section>
          )}
          {query.isLoading && <div className="surface-card h-96 animate-pulse" />}
          {query.error && (
            <p className="surface-card p-5 text-sm text-destructive">{query.error.message}</p>
          )}
          {current && query.data && (
            <>
              <section className="surface-card p-4">
                <div className="mb-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={month === 0}
                    onClick={() => setMonth(month - 1)}
                  >
                    <ChevronLeft />
                  </Button>
                  <h2 className="thai-heading text-base">
                    {new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(`${current[0]}-01T00:00:00Z`))}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={month >= groups.length - 1}
                    onClick={() => setMonth(month + 1)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
                  {"อา จ อ พ พฤ ศ ส".split(" ").map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                  {Array.from({ length: firstOffset }).map((_, i) => (
                    <span key={`blank-${i}`} />
                  ))}
                  {current[1].map((day) => (
                    <Button
                      key={day.date}
                      variant="ghost"
                      onClick={() => setSelected(day)}
                      className={`h-10 min-w-0 px-0 text-[11px] ${tone[day.level] ?? ""}`}
                      title={`${day.level} ${day.overall}`}
                    >
                      {Number(day.date.slice(-2))}
                    </Button>
                  ))}
                </div>
              </section>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {Object.keys(tone).map((label) => (
                  <span key={label} className={`rounded-md px-2 py-1.5 ${tone[label]}`}>
                    {label}
                  </span>
                ))}
              </div>
              <footer className="surface-inset p-4 text-[10.5px] leading-5 text-muted-foreground">
                <p className="text-foreground">
                  กฎ {query.data.evidence.ruleCode} · v{query.data.evidence.version}
                </p>
                {query.data.evidence.citations.map((c) => (
                  <p key={c.locator}>
                    อ้างอิง: {c.title} — {c.locator}
                  </p>
                ))}
                <p className="mt-2">
                  ความเชื่อมั่นเชิงวิธีคำนวณ {Math.round(query.data.confidence * 100)}% · {query.data.timeBasis === "exact" ? "ใช้เวลาเกิด" : "ไม่ใช้ลัคนาหรือภพ เพราะไม่ทราบเวลาเกิด"}
                </p>
              </footer>
            </>
          )}
          <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
            <SheetContent
              side="bottom"
              className="mx-auto max-h-[86vh] max-w-lg overflow-y-auto rounded-t-[28px]"
            >
              <SheetHeader>
                <SheetTitle className="text-left text-gold">
                  {selected && buddhistDate(selected.date)}
                </SheetTitle>
              </SheetHeader>
              {selected && (
                <div className="mt-5 space-y-4">
                  <div className="flex items-end justify-between">
                    <span className={`rounded-md px-2 py-1 text-xs ${tone[selected.level]}`}>
                      {selected.level}
                    </span>
                    <strong className="numeral text-3xl text-gold">{selected.overall}/100</strong>
                  </div>
                  <div>
                    {selected.suitable.length > 0 && (
                      <p className="text-xs text-success">
                        เหมาะกับ: {selected.suitable.join(" · ")}
                      </p>
                    )}
                    {selected.avoid.length > 0 && (
                      <p className="mt-2 text-xs text-destructive">
                        ควรเลี่ยง: {selected.avoid.join(" · ")}
                      </p>
                    )}
                  </div>
                  {selected.scores.map((score) => (
                    <div key={score.area}>
                      <div className="flex justify-between text-xs">
                        <span>{score.label}</span>
                        <span>{score.score}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${score.score}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {score.reasons[0] ?? "ไม่มีสัญญาณดาวเด่นในหมวดนี้"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </PageTransition>
    </AppShell>
  );
}
