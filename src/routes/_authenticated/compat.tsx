import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, HeartHandshake, History, Sparkles } from "lucide-react";
import { useState } from "react";

import { AppShell, PageTransition } from "@/components/AppShell";
import { HowToUseSheet } from "@/components/insights/HowToUseSheet";
import { Button } from "@/components/ui/button";
import { ShareResultButton } from "@/components/social/ShareResultButton";
import { useSession } from "@/hooks/useAuth";
import { readGuestBirthContext } from "@/lib/guest-birth";
import { downloadCanvas, guestContextToBirth } from "@/lib/insights-browser";
import {
  calculateGuestCompatibility,
  calculateMyCompatibility,
  listMyCompatibilityChecks,
} from "@/lib/insights.functions";
import type { CompatibilityResult } from "@/lib/insights.types";
import { findProvince, PROVINCES } from "@/lib/provinces";

export const Route = createFileRoute("/_authenticated/compat")({
  head: () => ({
    meta: [
      { title: "ดวงสมพงษ์ 5 มิติ | Horathai AI" },
      {
        name: "description",
        content: "เทียบดวงกำเนิดสองคนใน 5 มิติ พร้อมคำแนะนำ กฎ และแหล่งอ้างอิง",
      },
      { property: "og:title", content: "ดวงสมพงษ์ 5 มิติ | Horathai AI" },
      {
        property: "og:description",
        content: "ทัศนคติ ความรัก หุ้นส่วน เจ้านาย และลูกน้อง จากข้อมูลดวงจริง",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompatPage,
});

function CompatPage() {
  const { session, loading } = useSession();
  const guest = typeof window === "undefined" ? null : readGuestBirthContext();
  const mine = useServerFn(calculateMyCompatibility);
  const publicFn = useServerFn(calculateGuestCompatibility);
  const historyFn = useServerFn(listMyCompatibilityChecks);
  const history = useQuery({
    queryKey: ["compat-history"],
    queryFn: () => historyFn(),
    enabled: Boolean(session),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [form, setForm] = useState({
    label: "",
    birthDate: "",
    birthTime: "12:00",
    birthTimeKnown: true,
    province: "กรุงเทพมหานคร",
  });
  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const place = findProvince(form.province);
      const partner = {
        label: form.label,
        birthDate: form.birthDate,
        birthTime: form.birthTimeKnown ? form.birthTime : undefined,
        birthTimeKnown: form.birthTimeKnown,
        country: "ประเทศไทย",
        province: form.province,
        district: null,
        latitude: place.lat,
        longitude: place.lon,
        timezone: "Asia/Bangkok",
      };
      const data = session
        ? await mine({ data: partner })
        : guest
          ? await publicFn({ data: { birth: guestContextToBirth(guest), partner } })
          : null;
      if (data) {
        setResult(data);
        history.refetch();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "คำนวณไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };
  const share = () => {
    if (!result) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const c = canvas.getContext("2d");
    if (!c) return;
    const g = c.createLinearGradient(0, 0, 1080, 1350);
    g.addColorStop(0, "#07060D");
    g.addColorStop(1, "#281B3F");
    c.fillStyle = g;
    c.fillRect(0, 0, 1080, 1350);
    c.strokeStyle = "#D9B44A";
    c.lineWidth = 3;
    c.strokeRect(64, 64, 952, 1222);
    c.fillStyle = "#D9B44A";
    c.font = "56px serif";
    c.fillText("HORATHAI · ดวงสมพงษ์", 110, 170);
    c.font = "160px serif";
    c.fillText(String(result.overall), 110, 400);
    c.font = "32px sans-serif";
    c.fillText("คะแนนรวม / 100", 410, 390);
    c.fillStyle = "#FFFFFF";
    result.dimensions.forEach((d, i) =>
      c.fillText(`${d.label}  ${d.score}/100`, 110, 560 + i * 110),
    );
    c.fillStyle = "#AFA9BC";
    c.font = "25px sans-serif";
    c.fillText(`กฎ ${result.evidence.ruleCode} · ${result.engine}`, 110, 1180);
    c.fillText("เพื่อการสะท้อนตนเอง ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์", 110, 1230);
    downloadCanvas(canvas, "horathai-compat.png");
  };
  const field =
    "mt-2 h-11 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm outline-none focus:border-primary";
  return (
    <AppShell>
      <PageTransition>
        <div className="space-y-5 pb-8">
          <header className="flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow">Synastry</p>
              <h1 className="display mt-1 text-2xl text-gold">ดวงสมพงษ์</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                ความสัมพันธ์ 5 มิติจากดวงกำเนิดสองคน
              </p>
            </div>
            <HowToUseSheet title="อ่านคะแนนสมพงษ์อย่างไร">
              <p>
                คะแนนเปรียบเทียบมุมระหว่างดาวที่กฎกำหนดในแต่ละมิติ
                ไม่ใช่การตัดสินว่าความสัมพันธ์ดีหรือไม่ดี
              </p>
              <p>ข้อมูลเวลาเกิดที่ไม่ทราบจะลดความเชื่อมั่น และระบบจะไม่สร้างลัคนาหรือภพขึ้นเอง</p>
            </HowToUseSheet>
          </header>
          {!session && !guest ? (
            <section className="surface-card p-5 text-center">
              <HeartHandshake className="mx-auto h-8 w-8 text-[var(--gold)]" />
              <p className="mt-3 text-sm">ต้องมีดวงของคุณก่อนจึงจะเปรียบเทียบได้</p>
              <Button asChild className="mt-4">
                <Link to="/onboarding">ผูกดวงของฉัน</Link>
              </Button>
            </section>
          ) : (
            <section className="surface-card p-5">
              <h2 className="thai-heading text-base">ข้อมูลเกิดของอีกฝ่าย</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="col-span-2 text-xs text-muted-foreground">
                  ชื่อเรียก
                  <input
                    className={field}
                    maxLength={40}
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  วันเกิด
                  <input
                    type="date"
                    className={field}
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  เวลาเกิด
                  <input
                    type="time"
                    disabled={!form.birthTimeKnown}
                    className={field}
                    value={form.birthTime}
                    onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                  />
                </label>
                <label className="col-span-2 text-xs text-muted-foreground">
                  จังหวัด
                  <select
                    className={field}
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                  >
                    {PROVINCES.map((p) => (
                      <option key={p.th}>{p.th}</option>
                    ))}
                  </select>
                </label>
                <label className="col-span-2 flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={!form.birthTimeKnown}
                    onChange={(e) => setForm({ ...form, birthTimeKnown: !e.target.checked })}
                  />
                  ไม่ทราบเวลาเกิด
                </label>
              </div>
              {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
              <Button
                className="mt-4 h-12 w-full gap-2"
                disabled={busy || !form.label || !form.birthDate}
                onClick={submit}
              >
                <Sparkles className="h-4 w-4" />
                {busy ? "กำลังเทียบดวง…" : "คำนวณสมพงษ์"}
              </Button>
            </section>
          )}
          {session && history.data && history.data.length > 0 && (
            <section>
              <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <History className="h-4 w-4" />
                คนที่เคยบันทึก
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {history.data.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setResult(item.result_json as unknown as CompatibilityResult)}
                  >
                    {item.person_label} · {item.overall_score}
                  </Button>
                ))}
              </div>
            </section>
          )}
          {result && (
            <>
              <section className="surface-hero grain p-6 text-center">
                <p className="text-xs text-muted-foreground">คะแนนสมพงษ์รวม</p>
                <div
                  className="relative mx-auto mt-4 flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--gold) ${result.overall * 3.6}deg, color-mix(in oklab, var(--muted) 70%, transparent) 0)`,
                  }}
                >
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-background">
                    <strong className="numeral text-5xl text-gold">{result.overall}</strong>
                    <span className="text-[10px] text-muted-foreground">
                      ความเชื่อมั่น {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>
                {result.temporary && (
                  <p className="mt-4 text-[10px] text-warning">ผลชั่วคราว — ยังไม่ได้บันทึก</p>
                )}
              </section>
              <section className="space-y-3">
                {result.dimensions.map((d) => (
                  <article key={d.id} className="surface-card p-4">
                    <div className="flex justify-between text-sm">
                      <h2>{d.label}</h2>
                      <strong className="text-gold">{d.score}</strong>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${d.score}%` }} />
                    </div>
                    <p className="mt-3 text-xs leading-6 text-foreground/80">{d.explanation}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{d.facts.join(" · ")}</p>
                  </article>
                ))}
              </section>
              <Button variant="outline" className="h-12 w-full gap-2" onClick={share}>
                <Download className="h-4 w-4" />
                แชร์ผลเป็นภาพ
              </Button>
              {session && <ShareResultButton type="compatibility" />}
              <footer className="surface-inset p-4 text-[10.5px] leading-5 text-muted-foreground">
                <p className="text-foreground">
                  กฎ {result.evidence.ruleCode} · v{result.evidence.version}
                </p>
                {result.evidence.citations.map((c) => (
                  <p key={c.locator}>
                    อ้างอิง: {c.title} — {c.locator}
                  </p>
                ))}
                <p className="mt-2">{result.evidence.limitations[0]}</p>
              </footer>
            </>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
