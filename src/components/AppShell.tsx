import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bot, Crown, Home, Orbit, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "หน้าแรก", icon: Home },
  { to: "/chart", label: "ผังดวง", icon: Orbit },
  { to: "/transit", label: "ดาวย้าย", icon: Sparkles },
  { to: "/ai", label: "โหรAI", icon: Bot },
  { to: "/premium", label: "พรีเมียม", icon: Crown },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--gradient-void)]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-90"
        style={{ background: "var(--gradient-nebula)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-20%] left-[-20%] h-[60vh] w-[80vw] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.45 0.2 305 / 45%), transparent 65%)" }}
      />
      <main className="relative z-10 mx-auto w-full max-w-lg px-5 pb-32 pt-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="glass mx-4 flex w-full max-w-md items-center justify-between rounded-full px-2 py-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="relative flex flex-1 flex-col items-center gap-1 rounded-full px-1 py-2 text-[10px] text-muted-foreground transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full border border-primary/30 bg-primary/12"
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
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div className="mb-4">
      {kicker && (
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary/70">{kicker}</p>
      )}
      <h2 className="display mt-1 text-xl font-semibold text-foreground">{title}</h2>
    </div>
  );
}