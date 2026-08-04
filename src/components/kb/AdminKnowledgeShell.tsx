import { Link, useRouterState } from "@tanstack/react-router";
import { AlertTriangle, BookMarked, BookOpen, BrainCircuit, Database, FileSearch, FlaskConical, GraduationCap, History, Library, Menu, Orbit, Scale, Users } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export const KB_NAV = [
  { entity: "sources", label: "Sources", icon: Library },
  { entity: "documents", label: "Documents", icon: BookOpen },
  { entity: "rules", label: "Rules", icon: BookMarked },
  { entity: "review_queue", label: "Rule Review Queue", icon: History },
  { entity: "conflicts", label: "Conflicts", icon: AlertTriangle },
  { entity: "schools_systems", label: "Schools / Systems", icon: GraduationCap },
  { entity: "experts", label: "Experts", icon: Users },
  { entity: "benchmarks", label: "Benchmarks", icon: FlaskConical },
  { entity: "astronomy_profiles", label: "Astronomy Profiles", icon: Orbit },
  { entity: "ingestion_jobs", label: "Ingestion Jobs", icon: Database },
] as const;

export type KbEntity = (typeof KB_NAV)[number]["entity"];

export function AdminKnowledgeShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-background text-foreground"><header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/92 px-4 backdrop-blur-xl"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="เปิดเมนู"><Menu/></Button><div className="grid h-8 w-8 place-items-center rounded-md border border-primary/35 text-primary"><BrainCircuit className="h-4 w-4"/></div><div><p className="text-sm font-medium">Horathai Knowledge Governance</p><p className="text-[10px] text-muted-foreground">Thai astrology · auditable sources · published rules only</p></div><div className="ml-auto flex items-center gap-2"><span className="hidden rounded-md border border-warning/30 px-2 py-1 text-[10px] text-warning sm:inline-flex">ADMIN / REVIEWER</span><Button asChild variant="outline" size="sm"><Link to="/dashboard">กลับแอป</Link></Button></div></header><div className="mx-auto flex w-full max-w-[1600px]"><aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-border p-3 lg:block"><Nav/></aside><main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main></div><Sheet open={open} onOpenChange={setOpen}><SheetContent side="left" className="w-72"><SheetTitle>Knowledge Base</SheetTitle><div className="mt-6"><Nav onNavigate={() => setOpen(false)}/></div></SheetContent></Sheet></div>;
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return <nav className="space-y-1">{KB_NAV.map(({ entity, label, icon: Icon }) => { const path = `/admin-kb/${entity}`; const active = pathname.startsWith(path); return <Link key={entity} to={path} onClick={onNavigate} className={`flex h-10 items-center gap-3 rounded-md px-3 text-xs transition-colors ${active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="h-4 w-4"/><span>{label}</span></Link>; })}<div className="my-3 h-px bg-border"/><div className="rounded-md border border-border p-3"><div className="flex items-center gap-2 text-xs text-foreground"><Scale className="h-4 w-4 text-primary"/>Governance lock</div><p className="mt-2 text-[10px] leading-5 text-muted-foreground">Production อ่านเฉพาะ published rules ที่ citation ครบและไม่ติด conflict</p></div></nav>;
}

export function KbPageHeader({ title, description, icon: Icon = FileSearch }: { title: string; description: string; icon?: typeof FileSearch }) {
  return <div className="mb-6 flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/8 text-primary"><Icon className="h-5 w-5"/></div><div><h1 className="thai-heading text-2xl text-foreground">{title}</h1><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></div>;
}