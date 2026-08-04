import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Bot,
  CalendarDays,
  HeartHandshake,
  Layers3,
  Home,
  Orbit,
  Palette,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { LiveUniverse } from "@/components/cosmos/LiveUniverse";
import { ReviewModeBanner } from "@/components/ReviewModeBanner";
import { WalletPill, WalletSheet } from "@/components/wallet/WalletSheet";

const NAV = [
  { to: "/dashboard", label: "หน้าแรก", icon: Home },
  { to: "/birth-chart", label: "ผังดวง", icon: Orbit },
  { to: "/transits", label: "ดาวย้าย", icon: Sparkles },
  { to: "/ai-astrologer", label: "โหรAI", icon: Bot },
  { to: "/wallet", label: "กระเป๋า", icon: WalletCards },
] as const;

const INSIGHT_NAV = [
  { to: "/daily", label: "สีวันนี้", icon: Palette },
  { to: "/calendar", label: "ปฏิทิน", icon: CalendarDays },
  { to: "/compat", label: "สมพงษ์", icon: HeartHandshake },
  { to: "/tools", label: "ไพ่วันนี้", icon: Layers3 },
] as const;

export function AppShell({
  children,
  moonPhase,
  element,
}: {
  children: ReactNode;
  moonPhase?: number;
  element?: "ไฟ" | "ดิน" | "ลม" | "น้ำ";
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <LiveUniverse
        {...(moonPhase !== undefined ? { moonPhase } : {})}
        {...(element ? { element } : {})}
      />

      <main className="relative z-10 mx-auto w-full max-w-lg px-5 pb-32 pt-4">
        <div className="mb-4 flex justify-end">
          <WalletPill onClick={() => setWalletOpen(true)} />
        </div>
        <ReviewModeBanner />
        <nav aria-label="เครื่องมือประจำวัน" className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {INSIGHT_NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`press flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-[11px] ${pathname === to ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-card/50 text-muted-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </main>

      <WalletSheet open={walletOpen} onOpenChange={setWalletOpen} />

      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="glass-deep grain mx-4 flex w-full max-w-md items-center justify-between rounded-[28px] px-2 py-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="press relative flex flex-1 flex-col items-center gap-1 rounded-3xl px-1 py-2 text-[10px] text-muted-foreground"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-3xl border border-primary/30 bg-primary/12"
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="nav-glow"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute -bottom-1 h-6 w-10 rounded-full bg-primary/40 blur-lg"
                  />
                )}
                <Icon
                  className={`relative h-[18px] w-[18px] transition-colors ${active ? "text-primary" : ""}`}
                  strokeWidth={active ? 2.2 : 1.6}
                />
                <span className={`relative ${active ? "text-primary" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, filter: "blur(8px)", scale: 0.99 }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  kicker,
  title,
  right,
}: {
  kicker?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {kicker && (
          <p className="text-[10px] uppercase tracking-[0.34em] text-primary/70">{kicker}</p>
        )}
        <h2 className="display mt-1 text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function EmptyBirthData() {
  return (
    <div className="glass-deep grain rounded-[26px] p-6 text-center">
      <p className="display text-lg text-foreground">ยังไม่มีข้อมูลวันเกิด</p>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        กรอกวัน เวลา และจังหวัดที่เกิด เพื่อให้เราคำนวณลัคนาและตำแหน่งดาวจริงของคุณ
      </p>
      <Link
        to="/onboarding"
        className="press btn-gold mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl text-[14px] font-semibold text-primary-foreground"
      >
        ตั้งค่าดวงกำเนิด
      </Link>
    </div>
  );
}

export function LoadingSky({ label = "กำลังคำนวณตำแหน่งดาว…" }: { label?: string }) {
  return (
    <div className="glass grain flex h-56 flex-col items-center justify-center gap-4 rounded-[26px]">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-orbit-spin rounded-full border border-dashed border-primary/40" />
        <div className="absolute inset-0 m-auto h-6 w-6 animate-pulse-glow rounded-full bg-[radial-gradient(circle,var(--gold),transparent_70%)]" />
      </div>
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}
