import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarPlus, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWallet } from "@/hooks/useWallet";

export function DayPaywall({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="glass-deep grain mx-auto max-w-lg rounded-t-[28px] border-primary/25 px-6 pb-9 text-center">
        <span className="gold-metal mx-auto mt-2 grid h-14 w-14 place-items-center rounded-2xl"><CalendarPlus className="h-6 w-6" /></span>
        <SheetHeader className="mt-4 text-center">
          <SheetTitle className="thai-heading text-gold">เติมวันเพื่อเดินทางต่อ</SheetTitle>
          <SheetDescription>วันใช้งานของคุณหมดแล้ว เติมวันเพื่อเปิดคำพยากรณ์เชิงลึก โดยยังอยู่ในหน้าปัจจุบัน</SheetDescription>
        </SheetHeader>
        <Button asChild className="btn-gold mt-6 h-12 w-full rounded-2xl">
          <Link to="/wallet" search={{ checkout: "packages", returnTo: pathname }}><Sparkles /> เลือกแพ็กเกจวันใช้งาน</Link>
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => onOpenChange(false)}>ไว้ภายหลัง</Button>
      </SheetContent>
    </Sheet>
  );
}

export function DayCreditGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { data, isLoading, isSignedIn } = useWallet();
  if (isLoading) return fallback ?? null;
  if (!isSignedIn || data.daysRemaining <= 0) return fallback ?? null;
  return children;
}