import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Palette, Sparkles } from "lucide-react";

import { AppShell, PageTransition } from "@/components/AppShell";
import { HowToUseSheet } from "@/components/insights/HowToUseSheet";
import { Button } from "@/components/ui/button";
import { ShareResultButton } from "@/components/social/ShareResultButton";
import { useSession } from "@/hooks/useAuth";
import { readGuestBirthContext } from "@/lib/guest-birth";
import { buddhistDate, downloadCanvas, guestContextToBirth } from "@/lib/insights.client";
import { getGuestDailyInsight, getMyDailyInsight } from "@/lib/insights.functions";

export const Route = createFileRoute("/_authenticated/daily")({
  head: () => ({
    meta: [
      { title: "สีมงคลและพลังวันนี้ | Horathai AI" },
      {
        name: "description",
        content: "สีส่งเสริมประจำวันจากดาวจรเทียบดวงกำเนิด พร้อมเหตุผลและแหล่งอ้างอิง",
      },
      { property: "og:title", content: "สีมงคลและพลังวันนี้ | Horathai AI" },
      { property: "og:description", content: "ดูพลังดาวจร สีส่งเสริม และสีควรเลี่ยงของวันนี้" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const { session, loading } = useSession();
  const myDaily = useServerFn(getMyDailyInsight);
  const guestDaily = useServerFn(getGuestDailyInsight);
  const guest = typeof window === "undefined" ? null : readGuestBirthContext();
  const at = new Date().toISOString();
  const query = useQuery({
    queryKey: ["daily-insight", session?.user.id ?? "guest", at.slice(0, 10)],
    enabled: !loading && Boolean(session || guest),
    queryFn: () =>
      session
        ? myDaily({ data: { at } })
        : guestDaily({ data: { birth: guestContextToBirth(guest!), at } }),
    staleTime: 30 * 60 * 1000,
  });

  const makeWallpaper = () => {
    if (!query.data) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1170;
    canvas.height = 2532;
    const c = canvas.getContext("2d");
    if (!c) return;
    const gradient = c.createLinearGradient(0, 0, 1170, 2532);
    query.data.colors.forEach((color, i) =>
      gradient.addColorStop(i / (query.data.colors.length - 1), color.hex),
    );
    c.fillStyle = gradient;
    c.fillRect(0, 0, 1170, 2532);
    c.fillStyle = "rgba(5,5,12,.72)";
    c.fillRect(78, 1540, 1014, 720);
    c.fillStyle = "#F3D78B";
    c.font = "64px serif";
    c.fillText("HORATHAI", 130, 1680);
    c.fillStyle = "#FFFFFF";
    c.font = "48px sans-serif";
    c.fillText("สีส่งเสริมวันนี้", 130, 1780);
    c.font = "34px sans-serif";
    query.data.colors.forEach((color, i) =>
      c.fillText(`${color.label} · ${color.colorName}`, 130, 1880 + i * 74),
    );
    c.font = "28px sans-serif";
    c.fillText("แนวทางเชิงวัฒนธรรมเพื่อการสะท้อนตนเอง", 130, 2260);
    downloadCanvas(canvas, `horathai-daily-${at.slice(0, 10)}.png`);
  };

  return (
    <AppShell>
      <PageTransition>
        <div className="space-y-5 pb-8">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Daily orbit</p>
              <h1 className="display mt-1 text-2xl text-gold">สีมงคลและพลังวันนี้</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {buddhistDate(at)} · ดาวจรเทียบพื้นดวง
              </p>
            </div>
            <HowToUseSheet title="อ่านหน้านี้อย่างไร">
              <p>
                สีทั้ง 4 หมวดมาจากดาวที่มีน้ำหนักสูงในหมวดนั้น
                เมื่อเทียบตำแหน่งดาวจรกับดวงกำเนิดของคุณ
              </p>
              <p>
                คะแนน 0–100 ใช้เปรียบเทียบจังหวะของคุณในแต่ละวัน ไม่ใช่ความน่าจะเป็นหรือคำรับรองผล
              </p>
            </HowToUseSheet>
          </header>
          {!session && !guest && (
            <section className="surface-card p-5 text-center">
              <Palette className="mx-auto h-8 w-8 text-[var(--gold)]" />
              <p className="mt-3 text-sm">กรอกข้อมูลเกิดเพื่อคำนวณสีจากพื้นดวงจริง</p>
              <Button asChild className="mt-4">
                <Link to="/onboarding">ผูกดวงชั่วคราว</Link>
              </Button>
            </section>
          )}
          {query.isLoading && <div className="surface-card h-52 animate-pulse" />}
          {query.error && (
            <div className="surface-card p-5 text-sm text-destructive">{query.error.message}</div>
          )}
          {query.data && (
            <>
              <section className="surface-hero grain relative overflow-hidden p-6">
                <Sparkles className="h-5 w-5 text-[var(--gold)]" />
                <p className="mt-5 text-xs text-muted-foreground">พลังรวมวันนี้</p>
                <p className="numeral mt-1 text-5xl text-gold">
                  {query.data.overall}
                  <span className="text-base">/100</span>
                </p>
                <div className="mt-5 flex h-16 overflow-hidden rounded-lg">
                  {query.data.colors.map((color) => (
                    <div
                      key={color.id}
                      className="flex-1"
                      style={{ backgroundColor: color.hex }}
                      title={color.colorName}
                    />
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-muted-foreground">
                  ความเชื่อมั่นเชิงวิธีคำนวณ {Math.round(query.data.confidence * 100)}% · {query.data.timeBasis === "exact" ? "ใช้เวลาเกิด" : "ไม่ใช้ลัคนาหรือภพ เพราะไม่ทราบเวลาเกิด"}
                </p>
              </section>
              <section className="grid grid-cols-2 gap-3">
                {query.data.colors.map((color) => (
                  <article key={color.id} className="surface-card p-4">
                    <span
                      className="block h-8 w-8 rounded-full border border-foreground/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="mt-3 text-xs text-muted-foreground">{color.label}</p>
                    <h2 className="thai-heading mt-1 text-base">{color.colorName}</h2>
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                      {color.reason}
                    </p>
                  </article>
                ))}
              </section>
              <section className="surface-inset flex items-center gap-4 p-4">
                <span
                  className="h-10 w-10 shrink-0 rounded-full border border-destructive/40"
                  style={{ backgroundColor: query.data.avoid.hex }}
                />
                <div>
                  <p className="text-xs text-destructive">
                    สีที่ควรเลี่ยง · {query.data.avoid.colorName}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {query.data.avoid.reason}
                  </p>
                </div>
              </section>
              <Button className="h-12 w-full gap-2" onClick={makeWallpaper}>
                <Download className="h-4 w-4" />
                สร้างวอลเปเปอร์มือถือ
              </Button>
              {session && <ShareResultButton type="daily" />}
              <Evidence evidence={query.data.evidence} />
            </>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}

function Evidence({
  evidence,
}: {
  evidence: {
    ruleCode: string;
    version: string;
    confidence: number;
    citations: Array<{ sourceCode: string; title: string; locator: string }>;
    limitations: string[];
  };
}) {
  return (
    <footer className="surface-inset p-4 text-[10.5px] leading-5 text-muted-foreground">
      <p className="text-foreground">
        กฎ {evidence.ruleCode} · v{evidence.version} · ความเชื่อมั่นเชิงบรรณาธิการ{" "}
        {Math.round(evidence.confidence * 100)}%
      </p>
      {evidence.citations.map((c) => (
        <p key={c.locator}>
          อ้างอิง: {c.title} — {c.locator}
        </p>
      ))}
      <p className="mt-2">{evidence.limitations[0]}</p>
    </footer>
  );
}
