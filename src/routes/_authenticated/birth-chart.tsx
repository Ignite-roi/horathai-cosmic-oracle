import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState, type CSSProperties } from "react";

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
  const [selected, setSelected] = useState<ChartPlanet | null>(null);
  const data = useNatalChart(mode);

  const share = async () => {
    const text = data.ascendant ? `ดวงกำเนิดของฉัน ลัคนาราศี${data.ascendant.signTh} — Horathai AI` : "ดวงกำเนิดของฉัน — Horathai AI";
    if (navigator.share) await navigator.share({ title: "ดวงกำเนิด Horathai AI", text, url: window.location.href });
    else await navigator.clipboard.writeText(`${text} ${window.location.href}`);
  };

  return <AppShell><PageTransition>
    <BirthChartHero {...(data.ascendant?.signTh ? { ascendant: data.ascendant.signTh } : {})} isDemo={data.isDemo}/>
    <BirthChartTabs value={mode} onChange={setMode}/>
    {data.isDemo && <div className="mt-3 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-center text-[11px] text-warning">{data.profile ? "ดวงชั่วคราว — ยังไม่ได้บันทึก" : "โหมดตัวอย่าง · ข้อมูลนี้ไม่ถูกบันทึกและไม่แทนดวงจริงของคุณ"}</div>}
    {data.isLoading && <BirthChartLoadingState/>}
    {data.error && <BirthChartErrorState message={(data.error as Error).message} onRetry={data.retry}/>} 
    {!data.isLoading && !data.error && data.planets.length === 0 && <BirthChartEmptyState demo={data.isDemo}/>} 
    {!data.isLoading && !data.error && data.planets.length > 0 && <>
      <CosmicNatalOrrery planets={mode === "transit" && data.transitPlanets.length ? data.transitPlanets : data.planets} transitPlanets={mode === "both" ? data.transitPlanets : []} {...(data.ascendant?.longitude !== undefined ? { ascendant: data.ascendant.longitude } : {})} showAspects={showAspects} fullNames={fullNames} view={view} onSelect={setSelected}/>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">แตะดาวเพื่อดูรายละเอียด · ตำแหน่งตามลองจิจูดจริง</p>
      <ChartControls aspects={showAspects} names={fullNames} view={view} onAspects={setShowAspects} onNames={setFullNames} onView={setView} onReset={() => { setView("orbit"); setShowAspects(true); setFullNames(false); }}/>
      {!data.ascendant && !data.isDemo ? <BirthTimeUnknownState/> : data.ascendant && <AscendantRevealCard ascendant={{ signId: data.ascendant.signId, signTh: data.ascendant.signTh, degree: data.ascendant.degree, minute: data.ascendant.minute }} houseSystem={data.chart?.house_system ?? "whole_sign"}/>} 
      <PlanetPositionGrid planets={data.planets} onSelect={setSelected}/>
      {data.profile && data.chart && <BirthDataCertificate profile={data.profile} chart={data.chart}/>} 
      <GovernedReading facts={[`เอนจิน ${data.chart?.engine_type ?? "demo"}`, data.ascendant ? `ลัคนาราศี${data.ascendant.signTh}` : "ไม่กำหนดลัคนา", `ตำแหน่งดาว ${data.planets.length} ดวง`]} rules={[]} limitations={["ยังไม่มีกฎ published ใน Master Knowledge Base", "ไม่แสดงคำตีความที่ไม่มี citation", "เอนจิน sidereal_lahiri_dev ยังไม่ผ่าน independent benchmark"]}/>
      <BirthChartActions onShare={() => void share()}/>
      {data.isDemo && <BirthChartEmptyState demo/>}
    </>}
    <AnimatePresence>{selected && <PlanetSheet planet={selected} onClose={() => setSelected(null)}/>}</AnimatePresence>
  </PageTransition></AppShell>;
}

function PlanetSheet({ planet, onClose }: { planet: ChartPlanet; onClose: () => void }) {
  return <motion.div className="fixed inset-0 z-40 flex items-end justify-center bg-void/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} onClick={(event) => event.stopPropagation()} className="glass-deep grain w-full max-w-lg rounded-t-[28px] p-6 pb-[max(env(safe-area-inset-bottom),32px)]"><div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"><span className="planet-sphere h-14 w-14 text-lg" style={{ "--planet-color": planet.color } as CSSProperties}>{planet.thaiNumeral}</span><div className="min-w-0"><h3 className="thai-heading text-xl text-foreground">ดาว{planet.th}</h3><p className="text-xs text-muted-foreground">ข้อเท็จจริงจากการคำนวณ</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="ปิด"><X/></Button></div><div className="mt-5 grid grid-cols-2 gap-2">{[["ตำแหน่ง",`ราศี${planet.signTh} ${formatDegree(planet)}`],["เรือนชะตา",HOUSES[planet.house - 1]?.th ?? `ภพ ${planet.house}`],["ทิศทาง",planet.retrograde ? "พักร์" : "เดินหน้าปกติ"],["กำลังสัมพัทธ์",`${Math.round(planet.strength * 100)}%`]].map(([label,value]) => <div key={label} className="surface-inset p-3"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-xs text-foreground">{value}</p></div>)}</div><p className="mt-4 rounded-xl border border-warning/18 bg-warning/6 p-4 text-[12px] leading-6 text-muted-foreground">งดแสดงความหมายจนกว่าจะมีกฎโหราศาสตร์ไทยที่เผยแพร่และมี citation ครบ</p></motion.div></motion.div>;
}