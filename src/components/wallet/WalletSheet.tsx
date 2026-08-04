import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Coins, Gift, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLineAuth } from "@/context/LineAuthContext";
import { useWallet } from "@/hooks/useWallet";
import { formatThaiBuddhistDate } from "@/lib/wallet";

export function WalletPill({ onClick }: { onClick: () => void }) {
  const { data } = useWallet();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gold-hairline h-9 rounded-full bg-background/65 px-3 text-[11px] shadow-[var(--shadow-glow)] backdrop-blur-xl"
      aria-label="เปิดกระเป๋าวันใช้งาน"
    >
      <CalendarDays className="text-primary" />
      <span className="numeral text-foreground">{data.daysRemaining.toLocaleString("th-TH")} วัน</span>
      <span className="h-3 w-px bg-border" />
      <Coins className="text-warning" />
      <span className="numeral text-muted-foreground">{data.points.toLocaleString("th-TH")}</span>
    </Button>
  );
}

export function WalletSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data, isSignedIn } = useWallet();
  const { login } = useLineAuth();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="glass-deep grain mx-auto max-h-[88vh] max-w-lg overflow-y-auto rounded-t-[28px] border-primary/25 px-5 pb-8">
        <SheetHeader className="text-left">
          <SheetTitle className="thai-heading text-gold">กระเป๋าวันใช้งาน</SheetTitle>
          <SheetDescription>วันใช้งานคือสิทธิ์กลางสำหรับประสบการณ์เชิงลึกของ Horathai</SheetDescription>
        </SheetHeader>
        {isSignedIn ? (
          <>
            <div className="surface-hero mt-5 grid grid-cols-2 gap-3 p-5">
              <div>
                <p className="text-[10px] text-muted-foreground">คงเหลือ</p>
                <p className="display mt-1 text-3xl text-gold">{data.daysRemaining.toLocaleString("th-TH")} วัน</p>
              </div>
              <div className="border-l border-border pl-4">
                <p className="text-[10px] text-muted-foreground">แต้มสะสม</p>
                <p className="display mt-1 text-3xl text-foreground">{data.points.toLocaleString("th-TH")}</p>
              </div>
              <p className="col-span-2 flex items-center gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" /> ใช้ได้ถึง {formatThaiBuddhistDate(data.expiresAt)}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button asChild className="btn-gold h-12 rounded-2xl">
                <Link to="/wallet" search={{ checkout: "packages", returnTo: undefined }}>เติมวัน</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-2xl bg-background/50">
                <Link to="/invite"><Gift /> ชวนเพื่อน</Link>
              </Button>
            </div>
            <Link to="/wallet" search={{ checkout: undefined, returnTo: undefined }} className="press mt-4 flex items-center gap-3 rounded-2xl border border-border p-4">
              <WalletCards className="h-5 w-5 text-primary" />
              <span className="flex-1 text-[13px] text-foreground">ดูยอดและประวัติทั้งหมด</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </>
        ) : (
          <div className="mt-5 text-center">
            <p className="text-[13px] leading-6 text-muted-foreground">เข้าสู่ระบบด้วย LINE เพื่อเก็บวันใช้งาน แต้ม และประวัติของคุณอย่างปลอดภัย</p>
            <Button onClick={() => void login()} className="btn-gold mt-5 h-12 w-full rounded-2xl">เข้าสู่ระบบด้วย LINE</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}