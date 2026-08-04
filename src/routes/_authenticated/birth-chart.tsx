import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";

import { AppShell, PageTransition } from "@/components/AppShell";
import { BirthChartHero, BirthChartTabs, type ChartMode } from "@/components/chart/BirthChartHero";
import { ChartControls, type ChartView } from "@/components/chart/ChartControls";
import { CosmicNatalOrrery } from "@/components/chart/CosmicNatalOrrery";
import { AscendantRevealCard, BirthChartActions, BirthDataCertificate, PlanetPositionGrid } from "@/components/chart/ChartDetails";
import { BirthChartEmptyState, BirthChartErrorState, BirthChartLoadingState, BirthTimeUnknownState } from "@/components/chart/BirthChartStates";
import { Button } from "@/components/ui/button";
import { GovernedReading } from "@/components/kb/CitationSections";
import { useNatalChart } from "@/hooks/useNatalChart";
import { HOUSES, PLANET_BY_NUM, formatDegree } from "@/lib/astro";
import type { ChartPlanet } from "@/lib/astrology-engine.server";

export const Route = createFileRoute("/_authenticated/birth-chart")({
  head: () => ({ meta: [
    { title: "ดวงกำเนิดจักรวาล | Horathai AI" },
    { name: "description", content: "ผังดวงกำเนิดโหราศาสตร์ไทยจากลัคนาและตำแหน่งดาวจริง ในจักรวาล Obsidian Orrery" },
    { property: "og:title", content: "ดวงกำเนิดจักรวาล | Horathai AI" },
    { property: "og:description", content: "สำรวจลัคนา ดาวทั้งเก้า ภพ และคำอ่านดวงกำเนิดจากข้อมูลเกิดจริง" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: BirthChartPage,
});

function BirthChartPage() {
  const [mode, setMode] = useState<ChartMode>("natal");
  const [view, setView] = useState<ChartView>("orbit");
  const [showAspects, setShowAspects] = useState(true);
  const [fullNames, setFullNames] = useState(false);
  const [selected, setSelected] = useState<{ planet: ChartPlanet; origin: "natal" | "transit" } | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const [transitDate, setTransitDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const transitIso = useMemo(() => {
    const parsed = new Date(transitDate);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }, [transitDate]);
  const data = useNatalChart(mode, transitIso);

  const share = async () => {
    const text = data.ascendant ? `ดวงกำเนิดของฉัน ลัคนาราศี${data.ascendant.signTh} — Horathai AI` : "ดวงกำเนิดของฉัน — Horathai AI";
    if (navigator.share) await navigator.share({ title: "ดวงกำเนิด Horathai AI", text, url: window.location.href });
    else await navigator.clipboard.writeText(`${text} ${window.location.href}`);
  };

  return <AppShell><PageTransition>
    <BirthChartHero {...(data.ascendant?.signTh ? { ascendant: data.ascendant.signTh } : {})} isDemo={data.isDemo} temporary={data.isTemporary} privacy={privacy}/>
    <BirthChartTabs value={mode} onChange={setMode}/>
    {data.isDemo && <div className="mt-3 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-center text-[11px] text-warning">{data.isTemporary ? "ดวงชั่วคราว — ยังไม่ได้บันทึก" : "โหมดตัวอย่าง · ข้อมูลนี้ไม่ถูกบันทึกและไม่แทนดวงจริงของคุณ"}</div>}
    {data.isLoading && <BirthChartLoadingState/>}
    {data.error && <BirthChartErrorState message={(data.error as Error).message} onRetry={data.retry}/>} 
    {!data.isLoading && !data.error && data.planets.length === 0 && <BirthChartEmptyState demo={data.isDemo}/>} 
    {!data.isLoading && !data.error && data.planets.length > 0 && <>
       {data.profile && <ChartIdentity profile={data.profile} ascendant={data.ascendant} temporary={data.isTemporary} privacy={privacy}/>} 
       <CosmicNatalOrrery planets={data.planets} transitPlanets={data.transitPlanets} mode={mode} ascendantLabel={data.ascendant ? `${data.ascendant.signTh} ${data.ascendant.degree}°${String(data.ascendant.minute).padStart(2,"0")}′` : "ไม่ทราบเวลาเกิด"} {...(data.ascendant?.longitude !== undefined ? { ascendant: data.ascendant.longitude } : {})} showAspects={showAspects} fullNames={fullNames} view={view} onSelect={(planet, origin) => setSelected({ planet, origin })}/>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">แตะดาวเพื่อดูรายละเอียด · ตำแหน่งตามลองจิจูดจริง</p>
       <ChartControls aspects={showAspects} names={fullNames} view={view} privacy={privacy} transitDate={transitDate} showTransitDate={mode !== "natal"} onAspects={setShowAspects} onNames={setFullNames} onView={setView} onPrivacy={setPrivacy} onTransitDate={setTransitDate} onReset={() => { setView("orbit"); setShowAspects(true); setFullNames(false); setPrivacy(false); }}/>
      {!data.ascendant && !data.isDemo ? <BirthTimeUnknownState/> : data.ascendant && <AscendantRevealCard ascendant={{ signId: data.ascendant.signId, signTh: data.ascendant.signTh, degree: data.ascendant.degree, minute: data.ascendant.minute }} houseSystem={data.chart?.house_system ?? "whole_sign"}/>} 
       <PlanetPositionGrid planets={data.planets} onSelect={(planet) => setSelected({ planet, origin: "natal" })}/>
      {data.profile && data.chart && <BirthDataCertificate profile={data.profile} chart={data.chart}/>} 
      <GovernedReading facts={[`เอนจิน ${data.chart?.engine_type ?? "demo"}`, data.ascendant ? `ลัคนาราศี${data.ascendant.signTh}` : "ไม่กำหนดลัคนา", `ตำแหน่งดาว ${data.planets.length} ดวง`]} rules={[]} limitations={["ยังไม่มีกฎ published ใน Master Knowledge Base", "ไม่แสดงคำตีความที่ไม่มี citation", "เอนจิน sidereal_lahiri_dev ยังไม่ผ่าน independent benchmark"]}/>
      <BirthChartActions onShare={() => void share()}/>
       {data.isDemo && !data.isTemporary && <BirthChartEmptyState demo/>}
    </>}
    <AnimatePresence>{selected && <PlanetSheet planet={selected.planet} origin={selected.origin} onClose={() => setSelected(null)}/>}</AnimatePresence>
  </PageTransition></AppShell>;
}

function PlanetSheet({ planet, origin, onClose }: { planet: ChartPlanet; origin: "natal" | "transit"; onClose: () => void }) {
  return <motion.div className="fixed inset-0 z-40 flex items-end justify-center bg-void/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} onClick={(event) => event.stopPropagation()} className="glass-deep grain w-full max-w-lg rounded-t-[28px] p-6 pb-[max(env(safe-area-inset-bottom),32px)]"><div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"><span className="planet-sphere h-14 w-14 text-lg" style={{ "--planet-color": planet.color } as CSSProperties}>{planet.thaiNumeral}</span><div className="min-w-0"><p className="eyebrow">{origin === "natal" ? "Natal planet" : "Transit planet"}</p><h3 className="thai-heading text-xl text-foreground">ดาว{planet.th}</h3><p className="text-xs text-muted-foreground">ข้อเท็จจริงจากการคำนวณ</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="ปิด"><X/></Button></div><div className="mt-5 grid grid-cols-2 gap-2">{[["ตำแหน่ง",`ราศี${planet.signTh} ${formatDegree(planet)}`],["เรือนชะตา",HOUSES[planet.house - 1]?.th ?? `ภพ ${planet.house}`],["ทิศทาง",planet.retrograde ? "พักร์" : "เดินหน้าปกติ"],["ประเภท",origin === "natal" ? "ดาวกำเนิด" : "ดาวจร"]].map(([label,value]) => <div key={label} className="surface-inset p-3"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-xs text-foreground">{value}</p></div>)}</div><p className="mt-4 rounded-xl border border-warning/18 bg-warning/6 p-4 text-[12px] leading-6 text-muted-foreground">งดแสดงความหมายจนกว่าจะมีกฎโหราศาสตร์ไทยที่เผยแพร่และมี citation ครบ</p></motion.div></motion.div>;
}

function ChartIdentity({ profile, ascendant, temporary, privacy }: { profile: { nickname: string; birth_date: string; birth_time: string | null; birth_time_known: boolean; province: string; country: string }; ascendant: { signTh: string; degree: number; minute: number } | null; temporary: boolean; privacy: boolean }) {
  const born = new Date(`${profile.birth_date}T12:00:00`);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age -= 1;
  const weekday = new Intl.DateTimeFormat("th-TH", { weekday: "long" }).format(born);
  const buddhistYear = born.getFullYear() + 543;
  return <section className="surface-inset mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-4"><div className="min-w-0"><p className="eyebrow">Chart identity</p><h2 className="thai-heading mt-1 truncate text-xl text-foreground">{privacy ? "เจ้าของดวง" : profile.nickname}</h2><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{privacy ? "ข้อมูลวันเกิดถูกซ่อน" : `${weekday} · ${profile.birth_date} (พ.ศ. ${buddhistYear}) · ${profile.birth_time_known ? `${profile.birth_time?.slice(0,5)} น.` : "ไม่ทราบเวลา"}`}</p><p className="text-[11px] leading-5 text-muted-foreground">{privacy ? "ซ่อนสถานที่" : `${profile.province}, ${profile.country}`} · อายุ {privacy ? "—" : age} ปี</p></div><div className="shrink-0 text-right"><p className="text-[10px] text-muted-foreground">ลัคนา</p><p className="mt-1 text-sm text-primary">{ascendant ? `${ascendant.signTh} ${ascendant.degree}°${String(ascendant.minute).padStart(2,"0")}′` : "ไม่ระบุ"}</p>{temporary && <span className="mt-2 inline-block rounded-full border border-warning/30 px-2 py-1 text-[9px] text-warning">ดวงชั่วคราว</span>}</div></section>;
}